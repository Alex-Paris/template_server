import {
  IRateLimiterStoreOptions,
  RateLimiterMemory,
} from "rate-limiter-flexible";

import { redisDataSource } from "@shared/infra/redis/data-source";

export default {
  rateLimit: {
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
  } as IRateLimiterStoreOptions,

  ratePasswordLimit: {
    // Basic options.
    storeClient: redisDataSource,
    points: 5, // Number of points.
    duration: 60 * 60 * 3, // Store number for three hours since first fail

    // Custom
    execEvenly: false, // Do not delay actions evenly.
    blockDuration: 60 * 15, // Block for 15 minutes
    keyPrefix: "rate_password_limit", // must be unique for limiters with different purpose.
  } as IRateLimiterStoreOptions,
};
