import request from "supertest";

import { ICreateUserDTO } from "@modules/users/dtos/ICreateUserDTO";
import { CreateUserError } from "@modules/users/services/user/create/CreateUserError";
import { UpdateAvatarUserError } from "@modules/users/services/user/updateAvatar/UpdateAvatarUserError";

import { DiskStorageProvider } from "@shared/containers/providers/StorageProvider/implementations/DiskStorageProvider";
import { app } from "@shared/infra/http/app";
import { databaseSource } from "@shared/infra/typeorm/data-source";

import { User } from "../../typeorm/entities/User";
import { UsersRepository } from "../../typeorm/repositories/UsersRepository";

let testUser: User;
let testToken: string;
let newUser: ICreateUserDTO;

describe("Create User Controller", () => {
  beforeAll(async () => {
    // Connects at database and run migrations. It must be done in each test
    // controller file.
    await databaseSource.initialize();
    await databaseSource.runMigrations();

    // Put that new user information inside a var.
    newUser = {
      name: "Name Sample",
      email: "sample@email.com",
      password: "samplepass",
    };
  });

  afterAll(async () => {
    // Delete and destroy entirely data.
    await databaseSource.dropDatabase();
    await databaseSource.destroy();
  });

  it("should be able to create a new user", async () => {
    // Creates user.
    const response = await request(app).post("/api/v1/user").send(newUser);

    // Get the user saved at database for expecting test analisys.
    const user = await databaseSource
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

describe("Update Avatar User Controller", () => {
  beforeAll(async () => {
    // Connects at database and run migrations. It must be done in each test
    // controller file.
    await databaseSource.initialize();
    await databaseSource.runMigrations();

    // Create a user at "/api/v1/user" route to let possible to test.
    const { body: newUser } = await request(app).post("/api/v1/user").send({
      name: "Name Sample",
      email: "sample@email.com",
      password: "samplepass",
    });

    // Put that new user information inside a var.
    testUser = {
      ...newUser,
      password: "samplepass",
    };

    // Authenticate user.
    const { body: authToken } = await request(app)
      .post("/api/v1/session/authenticate")
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    // Put token inside a var.
    testToken = authToken.token;
  });

  afterAll(async () => {
    // Delete and destroy entirely data.
    await databaseSource.dropDatabase();
    await databaseSource.destroy();
  });

  it("should be able to update user avatar", async () => {
    // Mock disk storage to fake save file function.
    jest
      .spyOn(DiskStorageProvider.prototype, "saveFile")
      .mockImplementation(async () => {
        return "avatar.jpg";
      });

    // Update avatar user with mocked image.
    const response = await request(app)
      .patch("/api/v1/user/avatar")
      .set({
        Authorization: `Bearer ${testToken}`,
      });

    // Get the updated user for expecting test analisys.
    const user = (await databaseSource
      .createQueryBuilder<User>(User, "users")
      .where("users.id = :id", { id: testUser.id })
      .getOne()) as User;

    expect(response.status).toBe(200);
    expect(response.body.avatar).toBe("avatar.jpg");
    expect(response.body.avatar).toBe(user.avatar);
  });

  it("should not be able to update avatar from non existing user", async () => {
    // Mock user repository to fake authenticate middleware to not fount user.
    jest
      .spyOn(UsersRepository.prototype, "findById")
      .mockImplementationOnce(async () => {
        return null;
      });

    // Update avatar route with a valid token.
    const response = await request(app)
      .patch("/api/v1/user/avatar")
      .set({
        Authorization: `Bearer ${testToken}`,
      });

    // Get code and message error expected.
    const { statusCode, message } =
      new UpdateAvatarUserError.NotAuthenticatedUser();

    expect(response.status).toBe(statusCode);
    expect(response.body.message).toBe(message);
  });

  it("should delete old avatar when updating with a new one", async () => {
    // Mock disk storage to fake save file function.
    jest
      .spyOn(DiskStorageProvider.prototype, "saveFile")
      .mockImplementation(async () => {
        return "avatar2.jpg";
      });

    // Mock disk storage to fake save file function.
    const spyDelete = jest
      .spyOn(DiskStorageProvider.prototype, "deleteFile")
      .mockImplementation();

    // Update avatar router by the second time. Old image must be deleted.
    const response = await request(app)
      .patch("/api/v1/user/avatar")
      .set({
        Authorization: `Bearer ${testToken}`,
      });

    // Get the updated user for expecting test analisys.
    const user = (await databaseSource
      .createQueryBuilder<User>(User, "users")
      .where("users.id = :id", { id: testUser.id })
      .getOne()) as User;

    expect(response.status).toBe(200);
    expect(spyDelete).toBeCalledTimes(1);
    expect(response.body.avatar).toBe("avatar2.jpg");
    expect(response.body.avatar).toBe(user.avatar);
  });
});
