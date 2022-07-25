import { verify } from "jsonwebtoken";

import { User } from "@modules/users/infra/typeorm/entities/User";
import {
  EType,
  UserTokens,
} from "@modules/users/infra/typeorm/entities/UserTokens";
import { MockUsersRepository } from "@modules/users/repositories/mocks/MockUsersRepository";
import { MockUsersTokensRepository } from "@modules/users/repositories/mocks/MockUsersTokensRepository";

import auth from "@config/auth";

import { MockMailProvider } from "@shared/containers/providers/MailProvider/mocks/MockMailProvider";

import { compareInHours } from "@utils/date";

import { ForgotPasswordError } from "./ForgotPasswordError";
import { ForgotPasswordService } from "./ForgotPasswordService";

let mockUsersRepository: MockUsersRepository;
let mockUsersTokensRepository: MockUsersTokensRepository;
let mockMailProvider: MockMailProvider;
let forgotPasswordService: ForgotPasswordService;

let testUser: User;

describe("Forgot Password Service", () => {
  beforeAll(async () => {
    // Getting mocks components for service.
    mockUsersRepository = new MockUsersRepository();

    // Create user in mock for session tests
    testUser = await mockUsersRepository.create({
      name: "Name Sample",
      email: "sample@email.com",
      password: "samplepass",
    });
  });

  beforeEach(() => {
    // Getting mocks components for service.
    mockUsersTokensRepository = new MockUsersTokensRepository();
    mockMailProvider = new MockMailProvider();

    forgotPasswordService = new ForgotPasswordService(
      mockUsersRepository,
      mockUsersTokensRepository,
      mockMailProvider
    );
  });

  it("should be able to recover the password using the email", async () => {
    // Spy mocked providers.
    const sendMail = jest.spyOn(mockMailProvider, "sendMail");
    const createToken = jest.spyOn(mockUsersTokensRepository, "create");

    // Request recovery password mail.
    await forgotPasswordService.execute({
      email: testUser.email,
      remote_address: "127.0.0.1",
    });

    // Gets token returned in mock or create a new one if its null.
    const forgotToken = (await createToken.mock.results[0].value) as UserTokens;

    // Get the refresh token saved at mock provider for expecting test analisys.
    const { forgotSecret, forgotExpiresIn } = auth.jwt;
    const {
      type,
      created_at,
      created_by_ip,
      expires_at,
      refresh_token,
      user_id,
    } = forgotToken;

    expect(sendMail).toHaveBeenCalled();
    expect(type).toBe(EType.forgot_password);
    expect(verify(refresh_token, forgotSecret));
    expect(user_id).toBe(testUser.id);
    expect(created_by_ip).toBe("127.0.0.1");
    expect(compareInHours(created_at, expires_at)).toBe(forgotExpiresIn);
  });

  it("should not be able to recover with an unfound email", async () => {
    await expect(
      forgotPasswordService.execute({
        email: "invalid@email.com",
        remote_address: "127.0.0.1",
      })
    ).rejects.toBeInstanceOf(ForgotPasswordError.UserNotFound);
  });
});
