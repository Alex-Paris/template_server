import { verify } from "jsonwebtoken";
import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "@modules/users/repositories/IUsersRepository";
import { IUsersTokensRepository } from "@modules/users/repositories/IUsersTokensRepository";

import auth from "@config/auth";

import { IHashProvider } from "@shared/containers/providers/HashProvider/models/IHashProvider";

import { ResetPasswordError } from "./ResetPasswordError";

interface IRequestDTO {
  forgotToken: string;
  password: string;
  remoteAddress: string;
}

interface ITokenPayload {
  email: string;
  sub: string;
  iat: number;
  exp: number;
}

@injectable()
export class ResetPasswordService {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("UsersTokensRepository")
    private usersTokensRepository: IUsersTokensRepository,

    @inject("HashProvider")
    private hashProvider: IHashProvider
  ) {}

  /**
   * Reset a password of an email that was requested in "forgotPassword".
   * @param forgotToken forneced token in "ForgotPasswordService" mail.
   * @param password the new password setted for user.
   * @param remoteAddress ip address of request user.
   */
  async execute({
    forgotToken,
    password,
    remoteAddress,
  }: IRequestDTO): Promise<void> {
    const { forgotSecret } = auth.jwt;

    let decoded;

    // Validating if forgot token is a valid JWT.
    try {
      decoded = verify(forgotToken, forgotSecret);
    } catch {
      throw new ResetPasswordError.ForgotTokenInvalid();
    }

    // Obtaining forgot token data and database information.
    const { email, sub: userId } = decoded as ITokenPayload;

    const userToken =
      await this.usersTokensRepository.findByUserIdAndRefreshToken(
        userId,
        forgotToken
      );

    // Validating if forgot token was not found in database.
    if (!userToken) {
      throw new ResetPasswordError.ForgotTokenNotFound();
    }

    // Validating if forgot token was expired.
    if (userToken.getIsExpired()) {
      throw new ResetPasswordError.ForgotTokenExpired();
    }

    // Validating if forgot token was already used and revoked.
    if (userToken.getIsRevoked()) {
      throw new ResetPasswordError.ForgotTokenRevoked();
    }

    // Find and validate if requested email was found.
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new ResetPasswordError.UserNotFound();
    }

    // Revoke forgot token to garante that will be not be used again.
    await this.usersTokensRepository.revokeRefreshToken({
      userToken,
      ipAddress: remoteAddress,
      reason: "Forgot token used to reset password.",
    });

    // Remove old refresh tokens from user.
    await this.usersTokensRepository.deleteOldRefreshTokens(userId);

    user.password = await this.hashProvider.generateHash(password);

    await this.usersRepository.save(user);
  }
}
