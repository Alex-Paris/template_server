import request from "supertest";

import { app } from "@shared/infra/http/app";
import { pgDataSource } from "@shared/infra/typeorm/data-source";

import { UserTokens } from "../../typeorm/entities/UserTokens";

let authUser: Record<string, unknown>;

describe("Session Controller", () => {
  beforeAll(async () => {
    await pgDataSource.initialize();
    await pgDataSource.runMigrations();

    const { body } = await request(app).post("/api/v1/user").send({
      name: "Name Sample",
      email: "sample@email.com",
      password: "samplepass",
    });

    authUser = {
      ...body,
      password: "samplepass",
    };
  });

  afterAll(async () => {
    await pgDataSource.dropDatabase();
    await pgDataSource.destroy();
  });

  it("should be able to authenticate user session", async () => {
    const response = await request(app).post("/api/v1/session").send({
      email: authUser.email,
      password: authUser.password,
    });

    const userToken = await pgDataSource
      .createQueryBuilder<UserTokens>(UserTokens, "users_tokens")
      .where("users_tokens.user_id = :id", { id: authUser.id })
      .getOne();

    expect(response.status).toBe(200);
    expect(userToken).toBeInstanceOf(UserTokens);
    expect(response.body).toHaveProperty("token");
    expect(response.body.user.id).toBe(authUser.id);
    expect(response.body.refresh_token).toBe(userToken?.refresh_token);
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
