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

import { RefreshSessionError } from "./RefreshSessionError";
import { RefreshSessionService } from "./RefreshSessionService";

let mockUsersRepository: MockUsersRepository;
let mockUsersTokensRepository: MockUsersTokensRepository;
let refreshSessionService: RefreshSessionService;

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
    refreshSessionService = new RefreshSessionService(
      mockUsersTokensRepository
    );

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

  it("should be able to refresh user session", async () => {
    const response = await refreshSessionService.execute({
      cookieRefreshToken: refreshToken.refreshToken,
      remoteAddress: "127.0.0.1",
    });

    expect(response).toHaveProperty("token");
    expect(response).toHaveProperty("refreshToken");
  });

  it("should not be able to refresh with an invalid token", async () => {
    await expect(
      refreshSessionService.execute({
        cookieRefreshToken: "invalid-refresh-token",
        remoteAddress: "127.0.0.1",
      })
    ).rejects.toBeInstanceOf(RefreshSessionError.RefreshTokenInvalid);
  });

  it("should not be able to refresh with an unfound token", async () => {
    mockUsersTokensRepository.deleteById(refreshToken.id);

    await expect(
      refreshSessionService.execute({
        cookieRefreshToken: refreshToken.refreshToken,
        remoteAddress: "127.0.0.1",
      })
    ).rejects.toBeInstanceOf(RefreshSessionError.RefreshTokenNotFound);
  });

  it("should not be able to refresh with an expired token", async () => {
    jest.spyOn(utilDate, "dateNow").mockImplementationOnce(() => {
      return new Date("2199-12-17T00:00:00");
    });

    await expect(
      refreshSessionService.execute({
        cookieRefreshToken: refreshToken.refreshToken,
        remoteAddress: "127.0.0.1",
      })
    ).rejects.toBeInstanceOf(RefreshSessionError.RefreshTokenExpired);
  });

  it("should not be able to refresh with an revoked token", async () => {
    await refreshSessionService.execute({
      cookieRefreshToken: refreshToken.refreshToken,
      remoteAddress: "127.0.0.1",
    });

    await expect(
      refreshSessionService.execute({
        cookieRefreshToken: refreshToken.refreshToken,
        remoteAddress: "127.0.0.1",
      })
    ).rejects.toBeInstanceOf(RefreshSessionError.RefreshTokenRevoked);
  });
});
