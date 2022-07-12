import { User } from "@modules/users/infra/typeorm/entities/User";
import { MockUsersRepository } from "@modules/users/repositories/mocks/MockUsersRepository";

import { ICreateUserDTO } from "./CreateUserDTO";
import { CreateUserError } from "./CreateUserError";
import { CreateUserService } from "./CreateUserService";

let mockUsersRepository: MockUsersRepository;
let createUser: CreateUserService;
let newUser: ICreateUserDTO;

describe("Create User Service", () => {
  beforeAll(() => {
    newUser = {
      name: "Name Sample",
      email: "sample@email.com",
      password: "samplepass",
    };
  });

  beforeEach(() => {
    mockUsersRepository = new MockUsersRepository();
    createUser = new CreateUserService(mockUsersRepository);
  });

  it("should be able to create a new user", async () => {
    const user = await createUser.execute(newUser);

    expect(user).toBeInstanceOf(User);
    expect(user).toHaveProperty("id");
    expect(user.email).toBe(newUser.email);
  });

  it("should not be able to create user if email already in use", async () => {
    await createUser.execute(newUser);

    await expect(createUser.execute(newUser)).rejects.toBeInstanceOf(
      CreateUserError
    );
  });
});
