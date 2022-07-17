export default {
  jwt: {
    /** Secret code to encrypt/decrypt JWT tokens. */
    secret: process.env.APP_SECRET || "default",
    /** Expiration time for token. */
    expiresIn: "15m",

    /** Secret code to encrypt/decrypt JWT refresh tokens. */
    refreshSecret: process.env.APP_REFRESH_SECRET || "default",
    /** Expiration time for refresh token (in days). */
    refreshExpiresIn: 7,
    /** Refresh token time to live (in days). Inactive tokens are automatically
     * deleted from the database after this time.
     */
    refreshTTL: 3,
  },
};
