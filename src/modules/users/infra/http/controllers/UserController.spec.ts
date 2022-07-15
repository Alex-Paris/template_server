import request from "supertest";

import { ICreateUserDTO } from "@modules/users/services/createUser/CreateUserDTO";

import { app } from "@shared/infra/http/app";
import { pgDataSource } from "@shared/infra/typeorm/data-source";

import { User } from "../../typeorm/entities/User";

let newUser: ICreateUserDTO;

describe("User Controller", () => {
  beforeAll(async () => {
    await pgDataSource.initialize();
    await pgDataSource.runMigrations();

    newUser = {
      name: "Name Sample",
      email: "sample@email.com",
      password: "samplepass",
    };
  });

  afterAll(async () => {
    await pgDataSource.dropDatabase();
    await pgDataSource.destroy();
  });

  it("should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/user").send(newUser);
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

    expect(response.status).toBe(400);
  });
});
