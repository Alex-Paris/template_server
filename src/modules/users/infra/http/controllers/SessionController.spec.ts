import request from "supertest";

import { app } from "@shared/infra/http/app";
import { pgDataSource } from "@shared/infra/typeorm/data-source";

import { UserTokens } from "../../typeorm/entities/UserTokens";

let authUser: Record<string, unknown>;

describe("Session Controller", () => {
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
    authUser = {
      ...body,
      password: "samplepass",
    };
  });

  afterAll(async () => {
    // Delete and destroy entirely data.
    await pgDataSource.dropDatabase();
    await pgDataSource.destroy();
  });

  it("should be able to authenticate user session", async () => {
    // Authenticate user session.
    const response = await request(app).post("/api/v1/session").send({
      email: authUser.email,
      password: authUser.password,
    });

    // Get the refresh token saved at database for expecting test analisys.
    const userToken = await pgDataSource
      .createQueryBuilder<UserTokens>(UserTokens, "users_tokens")
      .where("users_tokens.user_id = :id", { id: authUser.id })
      .getOne();

    expect(response.status).toBe(200);
    expect(userToken).toBeInstanceOf(UserTokens);
    expect(response.body).toHaveProperty("token");
    expect(response.body.user.id).toBe(authUser.id);
    expect(String(response.header["set-cookie"]).split("; ")[0]).toContain(
      userToken?.refresh_token
    );
  });

  it("should not be able to authenticate with an invalid email", async () => {
    const response = await request(app).post("/api/v1/session").send({
      email: "invalid@email.com",
      password: authUser.password,
    });

    expect(response.status).toBe(401);
  });

  it("should not be able to authenticate with an invalid password", async () => {
    const response = await request(app).post("/api/v1/session").send({
      email: authUser.email,
      password: "invalid-pass",
    });

    expect(response.status).toBe(401);
  });
});
