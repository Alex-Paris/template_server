import { Request, Response, NextFunction } from "express";
import { RateLimiterRedis } from "rate-limiter-flexible";

import rate from "@config/rate";

import { AppError } from "@shared/errors/AppError";

import { addSeconds, dateNow } from "@utils/date";

// Must be outside of function, besides memory will be reseted every request.
const rateLimiterRedis = new RateLimiterRedis(rate.rateLimit);

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
