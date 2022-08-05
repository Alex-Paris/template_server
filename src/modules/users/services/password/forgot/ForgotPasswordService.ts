import { sign } from "jsonwebtoken";
import path from "path";
import { inject, injectable } from "tsyringe";

import { EType } from "@modules/users/infra/typeorm/entities/UserTokens";
import { IUsersRepository } from "@modules/users/repositories/IUsersRepository";
import { IUsersTokensRepository } from "@modules/users/repositories/IUsersTokensRepository";

import auth from "@config/auth";

import { IMailProvider } from "@shared/containers/providers/MailProvider/models/IMailProvider";

import { addHours, dateNow } from "@utils/date";

import { ForgotPasswordError } from "./ForgotPasswordError";

interface IRequestDTO {
  email: string;
  remoteAddress: string;
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
   * @param remoteAddress ip address of request user.
   */
  async execute({ email, remoteAddress }: IRequestDTO): Promise<void> {
    const { forgotSecret, forgotExpiresIn } = auth.jwt;

    // Find and validate if requested email was found.
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new ForgotPasswordError.UserNotFound();
    }

    // Generate new forgot password token.
    const forgotToken = sign({ email }, forgotSecret, {
      subject: user.id,
      expiresIn: `${forgotExpiresIn}h`,
    });

    // Getting forgot token expiration date.
    const forgotExpiration = addHours(dateNow(), forgotExpiresIn);

    // Create a token directed to email to be used in recover link.
    const { refreshToken: token } = await this.usersTokensRepository.create({
      refreshToken: forgotToken,
      type: EType.forgotPassword,
      expiresAt: forgotExpiration,
      createdByIp: remoteAddress,
      userId: user.id,
    });

    // Remove old refresh and forgot tokens from user.
    await this.usersTokensRepository.deleteOldRefreshTokens(user.id);

    // Get the path to the template file used in this service.
    const forgotPasswordTemplate = path.resolve(
      __dirname,
      "..",
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
