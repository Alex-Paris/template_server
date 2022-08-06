import { Redis } from "ioredis";

import { redisDataSource } from "@shared/infra/redis/data-source";

import { ICacheProvider } from "../models/ICacheProvider";

export class RedisCacheProvider implements ICacheProvider {
  private client: Redis;

  constructor() {
    this.client = redisDataSource;
  }

  async save(key: string, value: any): Promise<void> {
    await this.client.set(key, JSON.stringify(value));
  }

  async recover<T>(key: string): Promise<T | null> {
    // Get data from key.
    const data = await this.client.get(key);

    if (!data) {
      return null;
    }

    // Parse JSON.
    const parsedData = JSON.parse(data) as T;

    return parsedData;
  }

  async invalidate(key: string): Promise<void> {
    await this.client.del(key);
  }

  async invalidatePrefix(prefix: string): Promise<void> {
    const keys = await this.client.keys(`${prefix}:*`);

    // Create pipeline to execute all deletes once.
    const pipeline = this.client.pipeline();

    keys.forEach((key) => {
      pipeline.del(key);
    });

    await pipeline.exec();
  }
}
