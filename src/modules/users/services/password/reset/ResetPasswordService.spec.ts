import { sign } from "jsonwebtoken";

import { User } from "@modules/users/infra/typeorm/entities/User";
import {
  EType,
  UserTokens,
} from "@modules/users/infra/typeorm/entities/UserTokens";
import { MockUsersRepository } from "@modules/users/repositories/mocks/MockUsersRepository";
import { MockUsersTokensRepository } from "@modules/users/repositories/mocks/MockUsersTokensRepository";

import auth from "@config/auth";

import { MockHashProvider } from "@shared/containers/providers/HashProvider/mocks/MockHashProvider";

import * as utilDate from "@utils/date";
import { addDays, dateNow } from "@utils/date";

import { ResetPasswordError } from "./ResetPasswordError";
import { ResetPasswordService } from "./ResetPasswordService";

let mockUsersRepository: MockUsersRepository;
let mockUsersTokensRepository: MockUsersTokensRepository;
let mockHashProvider: MockHashProvider;
let resetPasswordService: ResetPasswordService;

let testUser: User;
let testToken: UserTokens;

describe("Reset Password Service", () => {
  beforeAll(async () => {
    // Getting mocks components for service.
    mockUsersRepository = new MockUsersRepository();

    // Create user in mock for session tests.
    testUser = await mockUsersRepository.create({
      name: "Name Sample",
      email: "sample@email.com",
      password: "samplepass",
    });
  });

  beforeEach(async () => {
    // Getting mocks components for service.
    mockUsersTokensRepository = new MockUsersTokensRepository();
    mockHashProvider = new MockHashProvider();
    resetPasswordService = new ResetPasswordService(
      mockUsersRepository,
      mockUsersTokensRepository,
      mockHashProvider
    );

    const { email } = testUser;

    // Create a new forgot token.
    testToken = await mockUsersTokensRepository.create({
      refreshToken: sign({ email }, auth.jwt.forgotSecret, {
        subject: testUser.id,
        expiresIn: `${auth.jwt.forgotExpiresIn}d`,
      }),
      type: EType.forgotPassword,
      expiresAt: addDays(dateNow(), auth.jwt.forgotExpiresIn),
      createdByIp: "127.0.0.1",
      userId: testUser.id,
    });
  });

  it("should be able to reset user password", async () => {
    const newPass = "new-valid-password";

    await resetPasswordService.execute({
      forgotToken: testToken.refreshToken,
      password: newPass,
      remoteAddress: "127.0.0.1",
    });

    // Getting updated user password.
    const { password } = (await mockUsersRepository.findByEmail(
      testUser.email
    )) as User;

    // Getting revoked forgot token.
    const revokedToken = (await mockUsersTokensRepository.findById(
      testToken.id
    )) as UserTokens;

    expect(password).toBe(newPass);
    expect(revokedToken.getIsRevoked()).toBe(true);
    expect(revokedToken.revokedReason).toBe(
      "Forgot token used to reset password."
    );
  });

  it("should not be able to reset password with an invalid token", async () => {
    await expect(
      resetPasswordService.execute({
        forgotToken: "invalid-refresh-token",
        password: "new-valid-password",
        remoteAddress: "127.0.0.1",
      })
    ).rejects.toBeInstanceOf(ResetPasswordError.ForgotTokenInvalid);
  });

  it("should not be able to reset password with an unfound token", async () => {
    mockUsersTokensRepository.deleteById(testToken.id);

    await expect(
      resetPasswordService.execute({
        forgotToken: testToken.refreshToken,
        password: "new-valid-password",
        remoteAddress: "127.0.0.1",
      })
    ).rejects.toBeInstanceOf(ResetPasswordError.ForgotTokenNotFound);
  });

  it("should not be able to reset password with an expired token", async () => {
    jest.spyOn(utilDate, "dateNow").mockImplementationOnce(() => {
      return new Date("2199-12-17T00:00:00");
    });

    await expect(
      resetPasswordService.execute({
        forgotToken: testToken.refreshToken,
        password: "new-valid-password",
        remoteAddress: "127.0.0.1",
      })
    ).rejects.toBeInstanceOf(ResetPasswordError.ForgotTokenExpired);
  });

  it("should not be able to reset password with an revoked token", async () => {
    await resetPasswordService.execute({
      forgotToken: testToken.refreshToken,
      password: "new-valid-password",
      remoteAddress: "127.0.0.1",
    });

    await expect(
      resetPasswordService.execute({
        forgotToken: testToken.refreshToken,
        password: "new-valid-password",
        remoteAddress: "127.0.0.1",
      })
    ).rejects.toBeInstanceOf(ResetPasswordError.ForgotTokenRevoked);
  });

  it("should not be able to reset password with an unfound user", async () => {
    jest
      .spyOn(mockUsersRepository, "findByEmail")
      .mockImplementationOnce(async () => {
        return null;
      });

    await expect(
      resetPasswordService.execute({
        forgotToken: testToken.refreshToken,
        password: "new-valid-password",
        remoteAddress: "127.0.0.1",
      })
    ).rejects.toBeInstanceOf(ResetPasswordError.UserNotFound);
  });
});
