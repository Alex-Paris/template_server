declare namespace Express {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  export interface Request {
    /** Authenticated user forneced from middleware _'ensureAuthenticated'_. */
    user: {
      id: string;
    };
  }
}
