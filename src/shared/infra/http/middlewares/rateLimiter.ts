import { Request, Response, NextFunction } from "express";
import {
  RateLimiterMemory,
  RateLimiterRedis,
  RateLimiterRes,
} from "rate-limiter-flexible";

import rate from "@config/rate";

import { LimiterError } from "@shared/errors/LimiterError";
import { redisDataSource } from "@shared/infra/redis/data-source";

import { fillXRateLimitHeader } from "@utils/rate";

// Rate limit for IP brute-force. Get number of wrong tries in every requested
// route and block if limit reached.
// Must be outside of function, besides memory will be reseted every request.
const rateLimit = new RateLimiterRedis({
  // Basic options.
  storeClient: redisDataSource,
  points: rate.limits.rateLimitPoints, // Number of points.
  duration: 5, // Per second(s).
  blockDuration: 5, // Block for 5 seconds if consumed more than points.

  // Custom
  execEvenly: false, // Do not delay actions evenly.
  keyPrefix: "rate_limit", // must be unique for limiters with different purpose.

  // Redis specific
  inmemoryBlockOnConsumed: rate.limits.rateLimitInMemoBlockPoints, // If 10 points consumed in current duration.
  inmemoryBlockDuration: 30, // block for 30 seconds in current process memory.
  insuranceLimiter: new RateLimiterMemory(
    // It will be used only on Redis error as insurance.
    {
      points: rate.limits.rateLimitInsurancePoints, // 1 is fair if you have 5 workers and 1 cluster.
      duration: 5,
      execEvenly: false,
    }
  ),
});

export async function rateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { msBeforeNext, remainingPoints } = await rateLimit.consume(req.ip);
    fillXRateLimitHeader({
      res,
      msBeforeNext,
      remainingPoints,
      limitPoints: rateLimit.points,
    });
  } catch (err) {
    if (err instanceof Error) {
      // Some Redis error.
      // Never happen if `insuranceLimiter` set up.
      throw new Error(`Rate Limit Error: ${err}`);
    } else {
      // Can't consume.
      // If there is no error, rateLimiterRedis promise rejected with number
      // of ms before next request allowed.
      const { msBeforeNext, remainingPoints } = err as RateLimiterRes;
      throw new LimiterError({
        msBeforeNext,
        remainingPoints,
        limitPoints: rateLimit.points,
      });
    }
  }

  next();
}
