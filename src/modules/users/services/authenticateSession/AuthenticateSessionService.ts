import { instanceToInstance } from "class-transformer";
import { sign } from "jsonwebtoken";
import {
  RateLimiterMemory,
  RateLimiterRedis,
  RateLimiterRes,
} from "rate-limiter-flexible";
import { injectable, inject } from "tsyringe";

import { EType } from "@modules/users/infra/typeorm/entities/UserTokens";
import { IUsersRepository } from "@modules/users/repositories/IUsersRepository";
import { IUsersTokensRepository } from "@modules/users/repositories/IUsersTokensRepository";

import auth from "@config/auth";

import { IHashProvider } from "@shared/containers/providers/HashProvider/models/IHashProvider";
import { LimiterError } from "@shared/errors/LimiterError";

import { addDays, dateNow } from "@utils/date";
import { getEmailIPkey } from "@utils/rate";

import { User } from "../../infra/typeorm/entities/User";
import { AuthenticateSessionError } from "./AuthenticateSessionError";

interface IRequestDTO {
  email: string;
  password: string;
  remoteAddress: string;
  limiterSlowBruteByIP: RateLimiterRedis | RateLimiterMemory;
  limiterConsecutiveFailsByEmailAndIP: RateLimiterRedis | RateLimiterMemory;
}

interface IResponse {
  user: User;
  token: string;
  refreshToken: string;
  refreshExpiration: Date;
}

@injectable()
export class AuthenticateSessionService {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("UsersTokensRepository")
    private usersTokensRepository: IUsersTokensRepository,

    @inject("HashProvider")
    private hashProvider: IHashProvider
  ) {}

  /**
   * Authenticate user session.
   * @param email email of the user. Must not exist in repository.
   * @param password password of the user.
   * @param remoteAddress ip address of request user.
   * @param limiterSlowBruteByIP rate limiter for IP attempts.
   * @param limiterConsecutiveFailsByEmailAndIP rate limiter for email + IP.
   */
  public async execute({
    email,
    password,
    remoteAddress,
    limiterSlowBruteByIP,
    limiterConsecutiveFailsByEmailAndIP,
  }: IRequestDTO): Promise<IResponse> {
    const emailIPkey = getEmailIPkey(email, remoteAddress);
    const user = await this.usersRepository.findByEmail(email);

    // Validating if its a valid user.
    if (!user) {
      throw new AuthenticateSessionError.IncorrectEmailOrPasswordError();
    }

    const passwordMatched = await this.hashProvider.compareHash(
      password,
      user.password
    );

    // Comparing if inserted pass match with saved one.
    if (!passwordMatched) {
      // Consume wrong attempt by IP.
      try {
        await limiterSlowBruteByIP.consume(remoteAddress);
      } catch (err) {
        if (err instanceof Error) {
          throw new Error(`Rate Limit Error: ${err}`);
        } else {
          // Can't consume.
          const { msBeforeNext, remainingPoints } = err as RateLimiterRes;
          throw new LimiterError({
            msBeforeNext,
            remainingPoints,
            limitPoints: limiterSlowBruteByIP.points,
          });
        }
      }

      // Consume wrong attempt by username + IP.
      try {
        await limiterConsecutiveFailsByEmailAndIP.consume(emailIPkey);
      } catch (err) {
        if (err instanceof Error) {
          throw new Error(`Rate Limit Error: ${err}`);
        } else {
          // Can't consume.
          const { msBeforeNext, remainingPoints } = err as RateLimiterRes;
          throw new LimiterError({
            msBeforeNext,
            remainingPoints,
            limitPoints: limiterConsecutiveFailsByEmailAndIP.points,
          });
        }
      }

      throw new AuthenticateSessionError.IncorrectEmailOrPasswordError();
    }

    const { secret, expiresIn, refreshSecret, refreshExpiresIn } = auth.jwt;

    // Generate new token and refresh token.
    const token = sign({}, secret, {
      subject: user.id,
      expiresIn,
    });

    const refreshToken = sign({ email }, refreshSecret, {
      subject: user.id,
      expiresIn: `${refreshExpiresIn}d`,
    });

    // Getting refresh token expiration date for cookie.
    const refreshExpiration = addDays(dateNow(), refreshExpiresIn);

    // Create a new refresh token.
    await this.usersTokensRepository.create({
      refreshToken,
      type: EType.refreshToken,
      expiresAt: refreshExpiration,
      createdByIp: remoteAddress,
      userId: user.id,
    });

    // Remove old refresh tokens from user.
    await this.usersTokensRepository.deleteOldRefreshTokens(user.id);

    // Reset rate limit on successful authorisation.
    await limiterConsecutiveFailsByEmailAndIP.delete(emailIPkey);

    return {
      user: instanceToInstance(user),
      token,
      refreshToken,
      refreshExpiration,
    };
  }
}
