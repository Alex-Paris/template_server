import { User } from "@modules/users/infra/typeorm/entities/User";
import { MockUsersRepository } from "@modules/users/repositories/mocks/MockUsersRepository";
import { MockUsersTokensRepository } from "@modules/users/repositories/mocks/MockUsersTokensRepository";

import { MockHashProvider } from "@shared/containers/providers/HashProvider/mocks/MockHashProvider";

import { AuthenticateSessionError } from "./AuthenticateSessionError";
import { AuthenticateSessionService } from "./AuthenticateSessionService";

let mockUsersRepository: MockUsersRepository;
let mockUsersTokensRepository: MockUsersTokensRepository;
let mockHashProvider: MockHashProvider;
let authenticateSession: AuthenticateSessionService;

let authUser: User;

describe("Authenticate Session Service", () => {
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

  beforeEach(() => {
    // Getting mocks components for service.
    mockUsersTokensRepository = new MockUsersTokensRepository();
    mockHashProvider = new MockHashProvider();
    authenticateSession = new AuthenticateSessionService(
      mockUsersRepository,
      mockUsersTokensRepository,
      mockHashProvider
    );
  });

  it("should be able to authenticate user session", async () => {
    const response = await authenticateSession.execute({
      email: authUser.email,
      password: authUser.password,
      remote_address: "127.0.0.1",
    });

    expect(response).toHaveProperty("token");
    expect(response).toHaveProperty("refresh_token");
    expect(response.user.email).toBe(authUser.email);
  });

  it("should not be able to authenticate with an invalid email", async () => {
    await expect(
      authenticateSession.execute({
        email: "invalid@email.com",
        password: authUser.password,
        remote_address: "127.0.0.1",
      })
    ).rejects.toBeInstanceOf(
      AuthenticateSessionError.IncorrectEmailOrPasswordError
    );
  });

  it("should not be able to authenticate with an invalid password", async () => {
    await expect(
      authenticateSession.execute({
        email: authUser.email,
        password: "invalid-pass",
        remote_address: "127.0.0.1",
      })
    ).rejects.toBeInstanceOf(
      AuthenticateSessionError.IncorrectEmailOrPasswordError
    );
  });
});
