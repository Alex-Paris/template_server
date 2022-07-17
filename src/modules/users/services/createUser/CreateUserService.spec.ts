import { User } from "@modules/users/infra/typeorm/entities/User";
import { MockUsersRepository } from "@modules/users/repositories/mocks/MockUsersRepository";

import { MockHashProvider } from "@shared/containers/providers/HashProvider/mocks/MockHashProvider";

import { ICreateUserDTO } from "./CreateUserDTO";
import { CreateUserError } from "./CreateUserError";
import { CreateUserService } from "./CreateUserService";

let mockUsersRepository: MockUsersRepository;
let mockHashProvider: MockHashProvider;
let createUser: CreateUserService;
let newUser: ICreateUserDTO;

describe("Create User Service", () => {
  beforeAll(() => {
    // Put new user information inside a var.
    newUser = {
      name: "Name Sample",
      email: "sample@email.com",
      password: "samplepass",
    };
  });

  beforeEach(() => {
    // Getting mocks components for service.
    mockUsersRepository = new MockUsersRepository();
    mockHashProvider = new MockHashProvider();
    createUser = new CreateUserService(mockUsersRepository, mockHashProvider);
  });

  it("should be able to create a new user", async () => {
    const response = await createUser.execute(newUser);

    expect(response).toBeInstanceOf(User);
    expect(response).toHaveProperty("id");
    expect(response.email).toBe(newUser.email);
  });

  it("should not be able to create user if email already in use", async () => {
    await createUser.execute(newUser);

    await expect(createUser.execute(newUser)).rejects.toBeInstanceOf(
      CreateUserError.EmailAlreadyUsed
    );
  });
});
