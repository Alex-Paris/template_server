import { sign, verify } from "jsonwebtoken";
import { inject, injectable } from "tsyringe";

import { IUsersTokensRepository } from "@modules/users/repositories/IUsersTokensRepository";

import auth from "@config/auth";

import { addDays, dateNow } from "@utils/date";

import { RefreshSessionError } from "./RefreshSessionError";

interface IRequestDTO {
  cookie_refresh_token: string;
  remote_address: string;
}

interface IPayload {
  email: string;
  sub: string;
}

interface IResponse {
  token: string;
  refresh_token: string;
  refresh_expiration: Date;
}

@injectable()
export class RefreshSessionService {
  constructor(
    @inject("UsersTokensRepository")
    private usersTokensRepository: IUsersTokensRepository
  ) {}

  async execute({
    cookie_refresh_token,
    remote_address,
  }: IRequestDTO): Promise<IResponse> {
    const { secret, expiresIn, refreshSecret, refreshExpiresIn } = auth.jwt;

    let decoded;

    // Validating if refresh token is a valid JWT
    try {
      decoded = verify(cookie_refresh_token, refreshSecret);
    } catch {
      throw new RefreshSessionError.RefreshTokenInvalid();
    }

    // Obtaining refresh token data and database information
    const { email, sub: user_id } = decoded as IPayload;

    const userToken =
      await this.usersTokensRepository.findByUserIdAndRefreshToken(
        user_id,
        cookie_refresh_token
      );

    // Validating if refresh token was not found in database
    if (!userToken) {
      throw new RefreshSessionError.RefreshTokenNotFound();
    }

    // Validating if refresh token was expired
    if (userToken.getIsExpired()) {
      throw new RefreshSessionError.RefreshTokenExpired();
    }

    // Validating if refresh token was already used and revoked
    if (userToken.getIsRevoked()) {
      // revoke all descendant tokens in case this token has been compromised
      await this.usersTokensRepository.revokeDescendantRefreshToken({
        userToken,
        ipAddress: remote_address,
        reason: "Attempted reuse of revoked ancestor token",
      });

      throw new RefreshSessionError.RefreshTokenRevoked();
    }

    // Generate new token and refresh token
    const token = sign({}, secret, {
      subject: user_id,
      expiresIn,
    });

    const refresh_token = sign({ email }, refreshSecret, {
      subject: user_id,
      expiresIn: `${refreshExpiresIn}d`,
    });

    // Getting refresh token expiration date for cookie
    const refresh_expiration = addDays(dateNow(), refreshExpiresIn);

    // Replace old refresh token with a new one (rotate token)
    const { id: replacedByToken } = await this.usersTokensRepository.create({
      refresh_token,
      expires_at: refresh_expiration,
      created_by_ip: remote_address,
      user_id,
    });

    await this.usersTokensRepository.revokeRefreshToken({
      userToken,
      ipAddress: remote_address,
      reason: "Refresh token used and replaced",
      replacedByToken,
    });

    // Remove old refresh tokens from user
    await this.usersTokensRepository.deleteOldRefreshTokens(user_id);

    return {
      token,
      refresh_token,
      refresh_expiration,
    };
  }
}
