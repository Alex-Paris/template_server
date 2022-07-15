import { MockUsersRepository } from "@modules/users/repositories/mocks/MockUsersRepository";
import { MockUsersTokensRepository } from "@modules/users/repositories/mocks/MockUsersTokensRepository";

import { MockHashProvider } from "@shared/containers/providers/HashProvider/mocks/MockHashProvider";

import { ICreateUserDTO } from "../createUser/CreateUserDTO";
import { AuthenticateSessionError } from "./AuthenticateSessionError";
import { AuthenticateSessionService } from "./AuthenticateSessionService";

let mockUsersRepository: MockUsersRepository;
let mockUsersTokensRepository: MockUsersTokensRepository;
let mockHashProvider: MockHashProvider;
let authenticateSession: AuthenticateSessionService;
let authUser: ICreateUserDTO;

describe("Authenticate Session Service", () => {
  beforeAll(() => {
    authUser = {
      name: "Name Sample",
      email: "sample@email.com",
      password: "samplepass",
    };

    mockUsersRepository = new MockUsersRepository();
    mockUsersRepository.create(authUser);
  });

  beforeEach(() => {
    mockUsersTokensRepository = new MockUsersTokensRepository();
    mockHashProvider = new MockHashProvider();
    authenticateSession = new AuthenticateSessionService(
      mockUsersRepository,
      mockUsersTokensRepository,
      mockHashProvider
    );
  });

  it("should be able to authenticate user session", async () => {
    const response = await authenticateSession.execute(authUser);

    expect(response).toHaveProperty("token");
    expect(response).toHaveProperty("refresh_token");
    expect(response.user.email).toBe(authUser.email);
  });

  it("should not be able to authenticate with an invalid email", async () => {
    await expect(
      authenticateSession.execute({
        email: "invalid@email.com",
        password: authUser.password,
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
      })
    ).rejects.toBeInstanceOf(
      AuthenticateSessionError.IncorrectEmailOrPasswordError
    );
  });
});
