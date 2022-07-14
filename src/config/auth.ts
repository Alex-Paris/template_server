export default {
  jwt: {
    secret: process.env.APP_SECRET || "default",
    expiresIn: "3h",

    refreshSecret: process.env.APP_REFRESH_SECRET || "default",
    refreshExpiresIn: "30d",
  },
};
