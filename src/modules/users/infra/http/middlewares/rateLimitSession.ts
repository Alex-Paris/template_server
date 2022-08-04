import { NextFunction, Request, Response } from "express";
import { RateLimiterRedis } from "rate-limiter-flexible";

import rate from "@config/rate";

import { LimiterError } from "@shared/errors/LimiterError";
import { redisDataSource } from "@shared/infra/redis/data-source";

import { getEmailIPkey } from "@utils/rate";

// Rate limit blocks IP for all failed attempts.
export const limiterSlowBruteByIP = new RateLimiterRedis({
  // Basic options.
  storeClient: redisDataSource,
  points: rate.limits.loginFailIpPerDayPoints,
  duration: 60 * 60 * 24, // Store number for one day or reset if right attempt.
  blockDuration: 60 * 60 * 24, // Block for 1 day.

  // Custom
  execEvenly: false, // Do not delay actions evenly.
  keyPrefix: "login_fail_ip_per_day",

  // Redis specific
  // If points here consumed use in memory instead Redis.
  inmemoryBlockOnConsumed: rate.limits.loginFailIpPerDayPoints + 5,
});

// Rate limit counts number of consecutive failed attempts for email and IP
// pair. Resets after successful login.
export const limiterConsecutiveFailsByEmailAndIP = new RateLimiterRedis({
  // Basic options.
  storeClient: redisDataSource,
  points: rate.limits.loginFailConsecutiveEmailAndIp,
  duration: 60 * 60 * 24 * 90, // Store number for 90 days since first fail.
  blockDuration: 60 * 60, // Block for 1 hour.

  // Custom
  execEvenly: false, // Do not delay actions evenly.
  keyPrefix: "login_fail_consecutive_email_and_ip",

  // Redis specific
  // If points here consumed use in memory instead Redis.
  inmemoryBlockOnConsumed: rate.limits.loginFailConsecutiveEmailAndIp + 5,
});

export async function rateLimitSession(
  req: Request,
  _: Response,
  next: NextFunction
): Promise<void> {
  const { loginFailIpPerDayPoints, loginFailConsecutiveEmailAndIp } =
    rate.limits;

  // Incoming request data.
  const ipAddr = req.ip;
  const emailIPkey = getEmailIPkey(req.body.email, ipAddr);

  // Getting data inside Redis to analise limiters.
  const [resSlowByIP, resEmailAndIP] = await Promise.all([
    limiterSlowBruteByIP.get(ipAddr),
    limiterConsecutiveFailsByEmailAndIP.get(emailIPkey),
  ]);

  // Check if IP is already blocked.
  if (
    resSlowByIP !== null &&
    resSlowByIP.consumedPoints > loginFailIpPerDayPoints
  ) {
    throw new LimiterError({
      msBeforeNext: resSlowByIP.msBeforeNext,
      remainingPoints: resSlowByIP.remainingPoints,
      limitPoints: limiterSlowBruteByIP.points,
    });
  }

  // Check if email + IP is already blocked.
  if (
    resEmailAndIP !== null &&
    resEmailAndIP.consumedPoints > loginFailConsecutiveEmailAndIp
  ) {
    throw new LimiterError({
      msBeforeNext: resEmailAndIP.msBeforeNext,
      remainingPoints: resEmailAndIP.remainingPoints,
      limitPoints: limiterConsecutiveFailsByEmailAndIP.points,
    });
  }

  // Inserting limiters inside express request.
  req.raterLimits = {
    limiterSlowBruteByIP,
    limiterConsecutiveFailsByEmailAndIP,
  };

  return next();
}
