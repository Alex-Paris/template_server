import { verify } from "jsonwebtoken";
import request from "supertest";

import { AuthenticateSessionError } from "@modules/users/services/session/authenticate/AuthenticateSessionError";
import { RefreshSessionError } from "@modules/users/services/session/refresh/RefreshSessionError";
import { RevokeSessionError } from "@modules/users/services/session/revoke/RevokeSessionError";

import auth from "@config/auth";

import { app } from "@shared/infra/http/app";
import { databaseSource } from "@shared/infra/typeorm/data-source";

import * as utilDate from "@utils/date";
import { delay } from "@utils/utils";

import { User } from "../../typeorm/entities/User";
import { EType, UserTokens } from "../../typeorm/entities/UserTokens";

let testUser: User;
let testToken: string;

describe("Authenticate Session Controller", () => {
  beforeAll(async () => {
    // Connects at database and run migrations. It must be done in each test
    // controller file.
    await databaseSource.initialize();
    await databaseSource.runMigrations();

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
    await databaseSource.dropDatabase();
    await databaseSource.destroy();
  });

  it("should be able to authenticate user session", async () => {
    // Authenticate user session.
    const response = await request(app)
      .post("/api/v1/session/authenticate")
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    // Get the refresh token saved at database for expecting test analisys.
    const userToken = (await databaseSource
      .createQueryBuilder<UserTokens>(UserTokens, "users_tokens")
      .where("users_tokens.user_id = :id", { id: testUser.id })
      .getOne()) as UserTokens;

    // Extract content to be used in expect.
    const cookieToken = String(response.header["set-cookie"]).split("; ")[0];
    const { compareInDays } = utilDate;
    const { refreshSecret, refreshExpiresIn } = auth.jwt;
    const { type, refreshToken, createdAt, expiresAt } = userToken;

    expect(response.status).toBe(200);
    expect(type).toBe(EType.refreshToken);
    expect(response.body).toHaveProperty("token");
    expect(response.body.user.id).toBe(testUser.id);
    expect(cookieToken).toContain(refreshToken);
    expect(verify(refreshToken, refreshSecret));
    expect(compareInDays(createdAt, expiresAt)).toBe(refreshExpiresIn);
  });

  it("should not be able to authenticate with an invalid email", async () => {
    const response = await request(app)
      .post("/api/v1/session/authenticate")
      .send({
        email: "invalid@email.com",
        password: testUser.password,
      });

    // Get code and message error expected.
    const { statusCode, message } =
      new AuthenticateSessionError.IncorrectEmailOrPasswordError();

    expect(response.status).toBe(statusCode);
    expect(response.body.message).toBe(message);
  });

  it("should not be able to authenticate with an invalid password", async () => {
    const response = await request(app)
      .post("/api/v1/session/authenticate")
      .send({
        email: testUser.email,
        password: "invalid-pass",
      });

    // Get code and message error expected.
    const { statusCode, message } =
      new AuthenticateSessionError.IncorrectEmailOrPasswordError();

    expect(response.status).toBe(statusCode);
    expect(response.body.message).toBe(message);
  });
});

describe("Refresh Session Controller", () => {
  beforeAll(async () => {
    // Connects at database and run migrations. It must be done in each test
    // controller file.
    await databaseSource.initialize();
    await databaseSource.runMigrations();

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
    await databaseSource.dropDatabase();
    await databaseSource.destroy();
  });

  beforeEach(async () => {
    // Deleting all tokens to avoid JWT with same code.
    await databaseSource
      .createQueryBuilder()
      .delete()
      .from(UserTokens)
      .execute();

    // Authenticate user session at "/api/v1/session/authenticate" route to
    // create a cookie of a refresh token.
    const response = await request(app)
      .post("/api/v1/session/authenticate")
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    // Getting cookied token generated by last authentication.
    [testToken] = String(response.headers["set-cookie"]).split("; ");
    [, testToken] = String(testToken).split("refreshToken=");
  });

  it("should be able to refresh user session token", async () => {
    // Refresh user session token.
    const response = await request(app)
      .post("/api/v1/session/refresh-token")
      .set("Accept-Language", "en")
      .set("Cookie", [`refreshToken=${testToken}`]);

    // Manipulating returned cookie to get the new generated refresh token.
    [testToken] = String(response.headers["set-cookie"]).split("; ");
    [, testToken] = String(testToken).split("refreshToken=");

    // Get the refresh token saved at database for expecting test analisys.
    const userToken = (await databaseSource
      .createQueryBuilder<UserTokens>(UserTokens, "users_tokens")
      .where("users_tokens.refresh_token = :testToken", { testToken })
      .getOne()) as UserTokens;

    // Extract content to be used in expect.
    const { compareInDays } = utilDate;
    const { refreshSecret, refreshExpiresIn } = auth.jwt;
    const { type, refreshToken, createdAt, expiresAt } = userToken;

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    // expect(response.body.user.id).toBe(authUser.id);
    expect(type).toBe(EType.refreshToken);
    expect(verify(refreshToken, refreshSecret));
    expect(compareInDays(createdAt, expiresAt)).toBe(refreshExpiresIn);
  });

  it("should not be able to refresh with an invalid token", async () => {
    const response = await request(app)
      .post("/api/v1/session/refresh-token")
      .set("Accept-Language", "en")
      .set("Cookie", ["invalid-refresh-token"]);

    // Get code and message error expected.
    const { statusCode, message } =
      new RefreshSessionError.RefreshTokenInvalid();

    expect(response.status).toBe(statusCode);
    expect(response.body.message).toBe(message);
  });

  it("should not be able to refresh with an unfound token", async () => {
    // Deleting valid token of database
    await databaseSource
      .createQueryBuilder()
      .delete()
      .from(UserTokens)
      .where("refresh_token = :testToken", { testToken })
      .execute();

    const response = await request(app)
      .post("/api/v1/session/refresh-token")
      .set("Accept-Language", "en")
      .set("Cookie", [`refreshToken=${testToken}`]);

    // Get code and message error expected.
    const { statusCode, message } =
      new RefreshSessionError.RefreshTokenNotFound();

    expect(response.status).toBe(statusCode);
    expect(response.body.message).toBe(message);
  });

  it("should not be able to refresh with an expired token", async () => {
    jest.spyOn(utilDate, "dateNow").mockImplementation(() => {
      return new Date("2199-12-17T00:00:00");
    });

    const response = await request(app)
      .post("/api/v1/session/refresh-token")
      .set("Accept-Language", "en")
      .set("Cookie", [`refreshToken=${testToken}`]);

    // Get code and message error expected.
    const { statusCode, message } =
      new RefreshSessionError.RefreshTokenExpired();

    expect(response.status).toBe(statusCode);
    expect(response.body.message).toBe(message);
  });

  it("should not be able to refresh with a revoked token", async () => {
    // This helps 'jsonwebtoken' to generate a different token. Otherwise, the
    // same token will be generated
    await delay(1000);

    await request(app)
      .post("/api/v1/session/refresh-token")
      .set("Accept-Language", "en")
      .set("Cookie", [`refreshToken=${testToken}`]);

    const response = await request(app)
      .post("/api/v1/session/refresh-token")
      .set("Accept-Language", "en")
      .set("Cookie", [`refreshToken=${testToken}`]);

    // Get code and message error expected.
    const { statusCode, message } =
      new RefreshSessionError.RefreshTokenRevoked();

    expect(response.status).toBe(statusCode);
    expect(response.body.message).toBe(message);
  });
});

describe("Revoke Session Controller", () => {
  beforeAll(async () => {
    // Connects at database and run migrations. It must be done in each test
    // controller file.
    await databaseSource.initialize();
    await databaseSource.runMigrations();

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
    await databaseSource.dropDatabase();
    await databaseSource.destroy();
  });

  beforeEach(async () => {
    // Deleting all tokens to avoid JWT with same code.
    await databaseSource
      .createQueryBuilder()
      .delete()
      .from(UserTokens)
      .execute();

    // Authenticate user session at "/api/v1/session/authenticate" route to
    // create a cookie of a refresh token.
    const response = await request(app)
      .post("/api/v1/session/authenticate")
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    // Getting cookied token generated by last authentication.
    [testToken] = String(response.headers["set-cookie"]).split("; ");
    [, testToken] = String(testToken).split("refreshToken=");
  });

  it("should be able to revoke user session token", async () => {
    // revoke user session token.
    const response = await request(app)
      .post("/api/v1/session/revoke-token")
      .set("Accept-Language", "en")
      .set("Cookie", [`refreshToken=${testToken}`]);

    // Get the revoked token saved at database for expecting test analisys.
    const userToken =
      (await databaseSource
        .createQueryBuilder<UserTokens>(UserTokens, "users_tokens")
        .where("users_tokens.refresh_token = :testToken", { testToken })
        .getOne()) || new UserTokens();

    expect(response.status).toBe(204);
    expect(userToken).toBeInstanceOf(UserTokens);
    expect(userToken.revokedReason).toBe("Refresh token revoked by user.");
  });

  it("should not be able to revoke with an invalid token", async () => {
    const response = await request(app)
      .post("/api/v1/session/revoke-token")
      .set("Accept-Language", "en")
      .set("Cookie", ["invalid-refresh-token"]);

    // Get code and message error expected.
    const { statusCode, message } =
      new RevokeSessionError.RefreshTokenInvalid();

    expect(response.status).toBe(statusCode);
    expect(response.body.message).toBe(message);
  });

  it("should not be able to revoke with an unfound token", async () => {
    // Deleting valid token of database
    await databaseSource
      .createQueryBuilder()
      .delete()
      .from(UserTokens)
      .where("refresh_token = :testToken", { testToken })
      .execute();

    const response = await request(app)
      .post("/api/v1/session/revoke-token")
      .set("Accept-Language", "en")
      .set("Cookie", [`refreshToken=${testToken}`]);

    // Get code and message error expected.
    const { statusCode, message } =
      new RevokeSessionError.RefreshTokenNotFound();

    expect(response.status).toBe(statusCode);
    expect(response.body.message).toBe(message);
  });

  it("should not be able to revoke with an expired token", async () => {
    jest.spyOn(utilDate, "dateNow").mockImplementation(() => {
      return new Date("2199-12-17T00:00:00");
    });

    const response = await request(app)
      .post("/api/v1/session/revoke-token")
      .set("Accept-Language", "en")
      .set("Cookie", [`refreshToken=${testToken}`]);

    // Get code and message error expected.
    const { statusCode, message } =
      new RevokeSessionError.RefreshTokenExpired();

    expect(response.status).toBe(statusCode);
    expect(response.body.message).toBe(message);
  });

  it("should not be able to revoke with a revoked token", async () => {
    await request(app)
      .post("/api/v1/session/revoke-token")
      .set("Accept-Language", "en")
      .set("Cookie", [`refreshToken=${testToken}`]);

    const response = await request(app)
      .post("/api/v1/session/revoke-token")
      .set("Accept-Language", "en")
      .set("Cookie", [`refreshToken=${testToken}`]);

    // Get code and message error expected.
    const { statusCode, message } =
      new RevokeSessionError.RefreshTokenRevoked();

    expect(response.status).toBe(statusCode);
    expect(response.body.message).toBe(message);
  });
});
