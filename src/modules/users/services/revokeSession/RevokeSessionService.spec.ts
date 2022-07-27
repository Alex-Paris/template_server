import { sign } from "jsonwebtoken";

import { User } from "@modules/users/infra/typeorm/entities/User";
import {
  EType,
  UserTokens,
} from "@modules/users/infra/typeorm/entities/UserTokens";
import { MockUsersRepository } from "@modules/users/repositories/mocks/MockUsersRepository";
import { MockUsersTokensRepository } from "@modules/users/repositories/mocks/MockUsersTokensRepository";

import auth from "@config/auth";

import * as utilDate from "@utils/date";
import { addDays, dateNow } from "@utils/date";

import { RevokeSessionError } from "./RevokeSessionError";
import { RevokeSessionService } from "./RevokeSessionService";

let mockUsersRepository: MockUsersRepository;
let mockUsersTokensRepository: MockUsersTokensRepository;
let revokeSessionService: RevokeSessionService;

let authUser: User;
let refreshToken: UserTokens;

describe("Refresh Session Service", () => {
  beforeAll(async () => {
    // Getting mocks components for service.
    mockUsersRepository = new MockUsersRepository();

    // Create user in mock for session tests
    authUser = await mockUsersRepository.create({
      name: "Name Sample",
      email: "sample@email.com",
      password: "samplepass",
    });
  });

  beforeEach(async () => {
    // Getting mocks components for service.
    mockUsersTokensRepository = new MockUsersTokensRepository();
    revokeSessionService = new RevokeSessionService(mockUsersTokensRepository);

    const { email } = authUser;

    // Create a new refresh token
    refreshToken = await mockUsersTokensRepository.create({
      refreshToken: sign({ email }, auth.jwt.refreshSecret, {
        subject: authUser.id,
        expiresIn: `${auth.jwt.refreshExpiresIn}d`,
      }),
      type: EType.refreshToken,
      expiresAt: addDays(dateNow(), auth.jwt.refreshExpiresIn),
      createdByIp: "127.0.0.1",
      userId: authUser.id,
    });
  });

  it("should be able to revoke user session", async () => {
    await revokeSessionService.execute({
      cookieRefreshToken: refreshToken.refreshToken,
      remoteAddress: "127.0.0.1",
    });

    const token =
      (await mockUsersTokensRepository.findById(refreshToken.id)) ||
      new UserTokens();

    expect(token.id).toBe(refreshToken.id);
    expect(token.revokedByIp).toBe(refreshToken.createdByIp);
    expect(token.revokedReason).toBe("Refresh token revoked by user.");
  });

  it("should not be able to revoke with an invalid token", async () => {
    await expect(
      revokeSessionService.execute({
        cookieRefreshToken: "invalid-refresh-token",
        remoteAddress: "127.0.0.1",
      })
    ).rejects.toBeInstanceOf(RevokeSessionError.RefreshTokenInvalid);
  });

  it("should not be able to revoke with an unfound token", async () => {
    mockUsersTokensRepository.deleteById(refreshToken.id);

    await expect(
      revokeSessionService.execute({
        cookieRefreshToken: refreshToken.refreshToken,
        remoteAddress: "127.0.0.1",
      })
    ).rejects.toBeInstanceOf(RevokeSessionError.RefreshTokenNotFound);
  });

  it("should not be able to revoke with an expired token", async () => {
    jest.spyOn(utilDate, "dateNow").mockImplementationOnce(() => {
      return new Date("2199-12-17T00:00:00");
    });

    await expect(
      revokeSessionService.execute({
        cookieRefreshToken: refreshToken.refreshToken,
        remoteAddress: "127.0.0.1",
      })
    ).rejects.toBeInstanceOf(RevokeSessionError.RefreshTokenExpired);
  });

  it("should not be able to revoke with an revoked token", async () => {
    await revokeSessionService.execute({
      cookieRefreshToken: refreshToken.refreshToken,
      remoteAddress: "127.0.0.1",
    });

    await expect(
      revokeSessionService.execute({
        cookieRefreshToken: refreshToken.refreshToken,
        remoteAddress: "127.0.0.1",
      })
    ).rejects.toBeInstanceOf(RevokeSessionError.RefreshTokenRevoked);
  });
});
