import { verify } from "jsonwebtoken";
import { inject, injectable } from "tsyringe";

import { IUsersTokensRepository } from "@modules/users/repositories/IUsersTokensRepository";

import auth from "@config/auth";

import { RevokeSessionError } from "./RevokeSessionError";

interface IRequestDTO {
  cookieRefreshToken: string;
  remoteAddress: string;
}

interface ITokenPayload {
  email: string;
  sub: string;
  iat: number;
  exp: number;
}

@injectable()
export class RevokeSessionService {
  constructor(
    @inject("UsersTokensRepository")
    private usersTokensRepository: IUsersTokensRepository
  ) {}

  /**
   * Refresh token for user session.
   * @param cookieRefreshToken refresh token forneced in a cookies request.
   * @param remoteAddress ip address of request user.
   */
  async execute({
    cookieRefreshToken,
    remoteAddress,
  }: IRequestDTO): Promise<void> {
    const { refreshSecret } = auth.jwt;

    let decoded;

    // Validating if refresh token is a valid JWT.
    try {
      decoded = verify(cookieRefreshToken, refreshSecret);
    } catch {
      throw new RevokeSessionError.RefreshTokenInvalid();
    }

    // Obtaining refresh token data and database information.
    const { sub: userId } = decoded as ITokenPayload;

    const userToken =
      await this.usersTokensRepository.findByUserIdAndRefreshToken(
        userId,
        cookieRefreshToken
      );

    // Validating if refresh token was not found in database.
    if (!userToken) {
      throw new RevokeSessionError.RefreshTokenNotFound();
    }

    // Validating if refresh token was expired.
    if (userToken.getIsExpired()) {
      throw new RevokeSessionError.RefreshTokenExpired();
    }

    // Validating if refresh token was already used and revoked.
    if (userToken.getIsRevoked()) {
      throw new RevokeSessionError.RefreshTokenRevoked();
    }

    // Revoke refresh token
    await this.usersTokensRepository.revokeRefreshToken({
      userToken,
      ipAddress: remoteAddress,
      reason: "Refresh token revoked by user.",
    });

    // Remove old refresh tokens from user.
    await this.usersTokensRepository.deleteOldRefreshTokens(userId);
  }
}
