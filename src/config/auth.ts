export default {
  jwt: {
    secret: process.env.APP_SECRET || "default",
    expiresIn: "15m",

    refreshSecret: process.env.APP_REFRESH_SECRET || "default",
    refreshExpiresIn: 7,
  },
};
