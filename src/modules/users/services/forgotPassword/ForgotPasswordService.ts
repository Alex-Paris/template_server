import { sign } from "jsonwebtoken";
import path from "path";
import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "@modules/users/repositories/IUsersRepository";
import { IUsersTokensRepository } from "@modules/users/repositories/IUsersTokensRepository";

import auth from "@config/auth";

import { IMailProvider } from "@shared/containers/providers/MailProvider/models/IMailProvider";

import { addDays, dateNow } from "@utils/date";

import { ForgotPasswordError } from "./ForgotPasswordError";

interface IRequestDTO {
  email: string;
  remote_address: string;
}

@injectable()
export class ForgotPasswordService {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("UsersTokensRepository")
    private usersTokensRepository: IUsersTokensRepository,

    @inject("MailProvider")
    private mailProvider: IMailProvider
  ) {}

  /**
   * Send a recover password mail to the requested email.
   * @param email forneced to be recovered.
   */
  async execute({ email, remote_address }: IRequestDTO): Promise<void> {
    const { forgotSecret, forgotExpiresIn } = auth.jwt;

    // Find and validate if requested email was found.
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new ForgotPasswordError.UserNotFound();
    }

    // Generate new forgot password token.
    const forgot_token = sign({ email }, forgotSecret, {
      subject: user.id,
      expiresIn: `${forgotExpiresIn}h`,
    });

    // Getting forgot token expiration date.
    const forgot_expiration = addDays(dateNow(), forgotExpiresIn);

    // Create a token directed to email to be used in recover link.
    const { refresh_token: token } = await this.usersTokensRepository.create({
      refresh_token: forgot_token,
      expires_at: forgot_expiration,
      created_by_ip: remote_address,
      user_id: user.id,
    });

    // Remove old refresh and forgot tokens from user.
    await this.usersTokensRepository.deleteOldRefreshTokens(user.id);

    // Get the path to the template file used in this service.
    const forgotPasswordTemplate = path.resolve(
      __dirname,
      "..",
      "..",
      "views",
      "forgot_password.hbs"
    );

    // Send recovery email.
    await this.mailProvider.sendMail({
      to: {
        name: user.name,
        email: user.email,
      },
      subject: "[Template] Password recovery",
      templateData: {
        file: forgotPasswordTemplate,
        variables: {
          name: user.name,
          link: `${process.env.APP_WEB_URL}/reset-password?token=${token}`,
        },
      },
    });
  }
}
