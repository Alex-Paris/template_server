import Redis from "ioredis";
import { RateLimiterMemory, RateLimiterRedis } from "rate-limiter-flexible";

import { User } from "@modules/users/infra/typeorm/entities/User";
import { MockUsersRepository } from "@modules/users/repositories/mocks/MockUsersRepository";
import { MockUsersTokensRepository } from "@modules/users/repositories/mocks/MockUsersTokensRepository";

import { MockHashProvider } from "@shared/containers/providers/HashProvider/mocks/MockHashProvider";
import { LimiterError } from "@shared/errors/LimiterError";

import { getEmailIPkey } from "@utils/rate";

import { AuthenticateSessionError } from "./AuthenticateSessionError";
import { AuthenticateSessionService } from "./AuthenticateSessionService";

let mockUsersRepository: MockUsersRepository;
let mockUsersTokensRepository: MockUsersTokensRepository;
let mockHashProvider: MockHashProvider;
let authenticateSession: AuthenticateSessionService;

let authUser: User;
let mockLimiterSlowBruteByIP: RateLimiterMemory;
let mockLimiterConsecutiveFailsByEmailAndIP: RateLimiterMemory;

const raterLimiterPoints = 100;
const ipAddress = "127.0.0.1";

describe("Authenticate Session Service", () => {
  beforeAll(async () => {
    // Getting mocks components for service.
    mockUsersRepository = new MockUsersRepository();

    // Create user in mock for session tests.
    authUser = await mockUsersRepository.create({
      name: "Name Sample",
      email: "sample@email.com",
      password: "samplepass",
    });
  });

  beforeEach(() => {
    // Getting mocks components for service.
    mockUsersTokensRepository = new MockUsersTokensRepository();
    mockHashProvider = new MockHashProvider();
    authenticateSession = new AuthenticateSessionService(
      mockUsersRepository,
      mockUsersTokensRepository,
      mockHashProvider
    );

    // Mock rater limits.
    mockLimiterSlowBruteByIP = new RateLimiterMemory({
      points: raterLimiterPoints,
      duration: 10,
    });
    mockLimiterConsecutiveFailsByEmailAndIP = new RateLimiterMemory({
      points: raterLimiterPoints,
      duration: 10,
    });
  });

  it("should be able to authenticate user session", async () => {
    const response = await authenticateSession.execute({
      email: authUser.email,
      password: authUser.password,
      remoteAddress: ipAddress,
      limiterSlowBruteByIP: mockLimiterSlowBruteByIP,
      limiterConsecutiveFailsByEmailAndIP:
        mockLimiterConsecutiveFailsByEmailAndIP,
    });

    expect(response).toHaveProperty("token");
    expect(response).toHaveProperty("refreshToken");
    expect(response.user.email).toBe(authUser.email);
  });

  it("should not be able to authenticate with an invalid email", async () => {
    await expect(
      authenticateSession.execute({
        email: "invalid@email.com",
        password: authUser.password,
        remoteAddress: ipAddress,
        limiterSlowBruteByIP: mockLimiterSlowBruteByIP,
        limiterConsecutiveFailsByEmailAndIP:
          mockLimiterConsecutiveFailsByEmailAndIP,
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
        remoteAddress: ipAddress,
        limiterSlowBruteByIP: mockLimiterSlowBruteByIP,
        limiterConsecutiveFailsByEmailAndIP:
          mockLimiterConsecutiveFailsByEmailAndIP,
      })
    ).rejects.toBeInstanceOf(
      AuthenticateSessionError.IncorrectEmailOrPasswordError
    );

    // Get the rate limit to expect analysis.
    const rateSlowIp = await mockLimiterSlowBruteByIP.get(ipAddress);
    const rateEmailAndIP = await mockLimiterConsecutiveFailsByEmailAndIP.get(
      getEmailIPkey(authUser.email, ipAddress)
    );

    expect(rateSlowIp?.consumedPoints).toBe(1);
    expect(rateEmailAndIP?.consumedPoints).toBe(1);
  });

  it("should block route if rate limit for IP can not connect with redis", async () => {
    // Generate a wrong limiter to forces an exception in consume.
    const wrongLimiterSlowBruteByIP = new RateLimiterRedis({
      storeClient: new Redis({ host: "invalid-host", commandTimeout: 100 }),
      points: 1,
      duration: 60,
    });

    await expect(
      authenticateSession.execute({
        email: authUser.email,
        password: "invalid-pass",
        remoteAddress: ipAddress,
        limiterSlowBruteByIP: wrongLimiterSlowBruteByIP,
        limiterConsecutiveFailsByEmailAndIP:
          mockLimiterConsecutiveFailsByEmailAndIP,
      })
    ).rejects.toBeInstanceOf(Error);
  });

  it("should block route if all points consumed for IP after an invalid password", async () => {
    // Consume all available points of rate limit.
    await mockLimiterSlowBruteByIP.consume(ipAddress, raterLimiterPoints);

    await expect(
      authenticateSession.execute({
        email: authUser.email,
        password: "invalid-pass",
        remoteAddress: ipAddress,
        limiterSlowBruteByIP: mockLimiterSlowBruteByIP,
        limiterConsecutiveFailsByEmailAndIP:
          mockLimiterConsecutiveFailsByEmailAndIP,
      })
    ).rejects.toBeInstanceOf(LimiterError);
  });

  it("should block route if rate limit for email and IP can not connect with redis", async () => {
    // Generate a wrong limiter to forces an exception in consume.
    const wrongLimiterConsecutiveFailsByEmailAndIP = new RateLimiterRedis({
      storeClient: new Redis({ host: "invalid-host", commandTimeout: 100 }),
      points: 1,
      duration: 60,
    });

    await expect(
      authenticateSession.execute({
        email: authUser.email,
        password: "invalid-pass",
        remoteAddress: ipAddress,
        limiterSlowBruteByIP: mockLimiterSlowBruteByIP,
        limiterConsecutiveFailsByEmailAndIP:
          wrongLimiterConsecutiveFailsByEmailAndIP,
      })
    ).rejects.toBeInstanceOf(Error);
  });

  it("should block route if all points consumed for email and IP after an invalid password", async () => {
    const key = getEmailIPkey(authUser.email, ipAddress);

    // Consume all available points of rate limit.
    await mockLimiterConsecutiveFailsByEmailAndIP.consume(
      key,
      raterLimiterPoints
    );

    await expect(
      authenticateSession.execute({
        email: authUser.email,
        password: "invalid-pass",
        remoteAddress: ipAddress,
        limiterSlowBruteByIP: mockLimiterSlowBruteByIP,
        limiterConsecutiveFailsByEmailAndIP:
          mockLimiterConsecutiveFailsByEmailAndIP,
      })
    ).rejects.toBeInstanceOf(LimiterError);
  });

  it("should reset rate limit for email and IP with a successful authentication", async () => {
    const key = getEmailIPkey(authUser.email, ipAddress);

    // Set a key with some points consumed in rate limit.
    await mockLimiterConsecutiveFailsByEmailAndIP.consume(key, 10);

    // Execute service with a valid email and pass.
    await authenticateSession.execute({
      email: authUser.email,
      password: authUser.password,
      remoteAddress: ipAddress,
      limiterSlowBruteByIP: mockLimiterSlowBruteByIP,
      limiterConsecutiveFailsByEmailAndIP:
        mockLimiterConsecutiveFailsByEmailAndIP,
    });

    // Get the rate limit to expect analysis.
    const rateLimit = await mockLimiterConsecutiveFailsByEmailAndIP.get(key);

    expect(rateLimit).toBe(null);
  });
});
