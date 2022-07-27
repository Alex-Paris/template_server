import { sign, verify } from "jsonwebtoken";
import { inject, injectable } from "tsyringe";

import { EType } from "@modules/users/infra/typeorm/entities/UserTokens";
import { IUsersTokensRepository } from "@modules/users/repositories/IUsersTokensRepository";

import auth from "@config/auth";

import { addDays, dateNow } from "@utils/date";

import { RefreshSessionError } from "./RefreshSessionError";

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

interface IResponse {
  token: string;
  refreshToken: string;
  refreshExpiration: Date;
}

@injectable()
export class RefreshSessionService {
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
  }: IRequestDTO): Promise<IResponse> {
    const { secret, expiresIn, refreshSecret, refreshExpiresIn } = auth.jwt;

    let decoded;

    // Validating if refresh token is a valid JWT.
    try {
      decoded = verify(cookieRefreshToken, refreshSecret);
    } catch {
      throw new RefreshSessionError.RefreshTokenInvalid();
    }

    // Obtaining refresh token data and database information.
    const { email, sub: userId } = decoded as ITokenPayload;

    const userToken =
      await this.usersTokensRepository.findByUserIdAndRefreshToken(
        userId,
        cookieRefreshToken
      );

    // Validating if refresh token was not found in database.
    if (!userToken) {
      throw new RefreshSessionError.RefreshTokenNotFound();
    }

    // Validating if refresh token was expired.
    if (userToken.getIsExpired()) {
      throw new RefreshSessionError.RefreshTokenExpired();
    }

    // Validating if refresh token was already used and revoked.
    if (userToken.getIsRevoked()) {
      // revoke all descendant tokens in case this token has been compromised.
      await this.usersTokensRepository.revokeDescendantRefreshToken({
        userToken,
        ipAddress: remoteAddress,
        reason: "Attempted reuse of revoked ancestor token",
      });

      throw new RefreshSessionError.RefreshTokenRevoked();
    }

    // Generate new token and refresh token.
    const token = sign({}, secret, {
      subject: userId,
      expiresIn,
    });

    const refreshToken = sign({ email }, refreshSecret, {
      subject: userId,
      expiresIn: `${refreshExpiresIn}d`,
    });

    // Getting refresh token expiration date for cookie.
    const refreshExpiration = addDays(dateNow(), refreshExpiresIn);

    // Replace old refresh token with a new one (rotate token).
    const { id: replacedByToken } = await this.usersTokensRepository.create({
      refreshToken,
      type: EType.refreshToken,
      expiresAt: refreshExpiration,
      createdByIp: remoteAddress,
      userId,
    });

    await this.usersTokensRepository.revokeRefreshToken({
      userToken,
      ipAddress: remoteAddress,
      reason: "Refresh token used and replaced.",
      replacedByToken,
    });

    // Remove old refresh tokens from user.
    await this.usersTokensRepository.deleteOldRefreshTokens(userId);

    return {
      token,
      refreshToken,
      refreshExpiration,
    };
  }
}
