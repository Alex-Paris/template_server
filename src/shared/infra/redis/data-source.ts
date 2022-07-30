import Redis from "ioredis";

/**
 * Redis datasource. Uses .env file to fill datasource options.
 */
export const redisDataSource = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASS || undefined,
  lazyConnect: true, // Forces to connect manually.
  commandTimeout: 3000, // Time waiting for command response.
  enableOfflineQueue: false, // Only works with if client is connected.
});
