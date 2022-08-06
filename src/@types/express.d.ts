declare namespace Express {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  export interface Request {
    /** Authenticated user forneced from middleware _'ensureAuthenticated'_. */
    user: {
      id: string;
    };

    /** Rater limits used in routerAuthenticated user forneced from middleware _'ensureAuthenticated'_. */
    raterLimits: {
      limiterSlowBruteByIP: RateLimiterRedis;
      limiterConsecutiveFailsByEmailAndIP: RateLimiterRedis;
    };
  }
}
