import { verify } from "jsonwebtoken";
import request from "supertest";

import { ForgotPasswordError } from "@modules/users/services/forgotPassword/ForgotPasswordError";

import auth from "@config/auth";

import { EtherealMailProvider } from "@shared/containers/providers/MailProvider/implementations/EtherealMailProvider";
import { app } from "@shared/infra/http/app";
import { pgDataSource } from "@shared/infra/typeorm/data-source";

import { compareInHours } from "@utils/date";

import { User } from "../../typeorm/entities/User";
import { EType, UserTokens } from "../../typeorm/entities/UserTokens";

let testUser: User;

describe("Forgot Password Controller", () => {
  beforeAll(async () => {
    // Connects at database and run migrations. It must be done in each test
    // controller file.
    await pgDataSource.initialize();
    await pgDataSource.runMigrations();

    // Create a user at "/api/v1/user" route to let possible to test sessions
    // controllers.
    const { body } = await request(app).post("/api/v1/user").send({
      name: "Name Sample",
      email: "sample@email.com",
      password: "samplepass",
    });

    // Put that new user information inside a var.
    testUser = {
      ...body,
      password: "samplepass",
    };
  });

  afterAll(async () => {
    // Delete and destroy entirely data.
    await pgDataSource.dropDatabase();
    await pgDataSource.destroy();
  });

  it("should be able to request a forgot password to the user", async () => {
    // Mock mail provider.
    const sendMail = jest
      .spyOn(EtherealMailProvider.prototype, "sendMail")
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .mockImplementationOnce(async () => {});

    // Request recovery password mail.
    const response = await request(app).post("/api/v1/password/forgot").send({
      email: testUser.email,
    });

    // Get the refresh token saved at database for expecting test analisys.
    const userToken = (await pgDataSource
      .createQueryBuilder<UserTokens>(UserTokens, "users_tokens")
      .where("users_tokens.user_id = :id", { id: testUser.id })
      .getOne()) as UserTokens;

    const { forgotSecret, forgotExpiresIn } = auth.jwt;
    const { type, createdAt, expiresAt, refreshToken } = userToken;

    expect(response.status).toBe(204);
    expect(sendMail).toHaveBeenCalled();
    expect(type).toBe(EType.forgotPassword);
    expect(verify(refreshToken, forgotSecret));
    expect(compareInHours(createdAt, expiresAt)).toBe(forgotExpiresIn);
  });

  it("should not be able to request a forgot password with an unfound email", async () => {
    const response = await request(app).post("/api/v1/password/forgot").send({
      email: "invalid@email.com",
    });

    // Get code and message error expected.
    const { statusCode, message } = new ForgotPasswordError.UserNotFound();

    expect(response.status).toBe(statusCode);
    expect(response.body.message).toBe(message);
  });
});
