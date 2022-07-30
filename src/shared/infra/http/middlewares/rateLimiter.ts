import { Request, Response, NextFunction } from "express";
import {
  IRateLimiterStoreOptions,
  RateLimiterMemory,
  RateLimiterRedis,
} from "rate-limiter-flexible";

import { AppError } from "@shared/errors/AppError";
import { redisDataSource } from "@shared/infra/redis/data-source";

import { addSeconds, dateNow } from "@utils/date";

// Options rate limiter.
const opts: IRateLimiterStoreOptions = {
  // Basic options.
  storeClient: redisDataSource,
  points: 5, // Number of points.
  duration: 5, // Per second(s).

  // Custom
  execEvenly: false, // Do not delay actions evenly.
  blockDuration: 5, // Block for 5 seconds if consumed more than points.
  keyPrefix: "rate_limit", // must be unique for limiters with different purpose.

  // Redis specific
  inmemoryBlockOnConsumed: 10, // If 10 points consumed in current duration.
  inmemoryBlockDuration: 30, // block for 30 seconds in current process memory.
  insuranceLimiter: new RateLimiterMemory(
    // It will be used only on Redis error as insurance.
    {
      points: 1, // 1 is fair if you have 5 workers and 1 cluster.
      duration: 5,
      execEvenly: false,
    }
  ),
};

const rateLimiterRedis = new RateLimiterRedis(opts);

export async function rateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  await rateLimiterRedis
    .consume(req.ip)
    .then((rateLimiterRes) => {
      // Client can consume.
      // Input rate limits in response header.
      const secs = Math.round(rateLimiterRes.msBeforeNext / 1000) || 1;
      res.set("X-RateLimit-Limit", String(rateLimiterRedis.points));
      res.set("X-RateLimit-Remaining", String(rateLimiterRes.remainingPoints));
      res.set("X-RateLimit-Reset", String(addSeconds(dateNow(), secs)));
      next();
    })
    .catch((rejRes) => {
      if (rejRes instanceof Error) {
        // Some Redis error.
        // Never happen if `insuranceLimiter` set up.
        throw new Error(`Rate Limit Error: ${rejRes}`);
      } else {
        // Can't consume.
        // If there is no error, rateLimiterRedis promise rejected with number
        // of ms before next request allowed.
        const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
        res.set("X-RateLimit-Limit", String(rateLimiterRedis.points));
        res.set("X-RateLimit-Remaining", String(rejRes.remainingPoints));
        res.set("X-RateLimit-Reset", String(addSeconds(dateNow(), secs)));
        res.set("Retry-After", String(secs));
        throw new AppError("Too many requests.", 429);
      }
    });
}
