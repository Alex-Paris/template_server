import request from "supertest";

import { ICreateUserDTO } from "@modules/users/dtos/ICreateUserDTO";
import { CreateUserError } from "@modules/users/services/createUser/CreateUserError";

import { app } from "@shared/infra/http/app";
import { pgDataSource } from "@shared/infra/typeorm/data-source";

import { User } from "../../typeorm/entities/User";

let newUser: ICreateUserDTO;

describe("User Controller", () => {
  beforeAll(async () => {
    // Connects at database and run migrations. It must be done in each test
    // controller file.
    await pgDataSource.initialize();
    await pgDataSource.runMigrations();

    // Put that new user information inside a var.
    newUser = {
      name: "Name Sample",
      email: "sample@email.com",
      password: "samplepass",
    };
  });

  afterAll(async () => {
    // Delete and destroy entirely data.
    await pgDataSource.dropDatabase();
    await pgDataSource.destroy();
  });

  it("should be able to create a new user", async () => {
    // Creates user.
    const response = await request(app).post("/api/v1/user").send(newUser);

    // Get the user saved at database for expecting test analisys.
    const user = await pgDataSource
      .createQueryBuilder<User>(User, "users")
      .where("users.email = :email", { email: newUser.email })
      .getOne();

    expect(response.status).toBe(201);
    expect(user).toBeInstanceOf(User);
    expect(response.body.id).toBe(user?.id);
  });

  it("should not be able to create an user if inserted email already exists", async () => {
    const response = await request(app).post("/api/v1/user").send(newUser);

    // Get code and message error expected.
    const { statusCode, message } = new CreateUserError.EmailAlreadyUsed();

    expect(response.status).toBe(statusCode);
    expect(response.body.message).toBe(message);
  });
});
