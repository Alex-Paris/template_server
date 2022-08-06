import "reflect-metadata";

// Enviroments
process.env.APP_SECRET = "jestsecretpass";
process.env.APP_REFRESH_SECRET = "jestrefreshsecretpass";

// PostgreSQL
process.env.PG_HOST = "localhost";
process.env.PG_PORT = "5432";
process.env.PG_DB = "dbnamesample";
process.env.PG_USER = "usernamesample";
process.env.PG_PASS = "passwordsample";
process.env.PG_MIGRATION = "false";

// Redis
process.env.REDIS_HOST = "localhost";
process.env.REDIS_PORT = "6379";
process.env.REDIS_PASS = "";

// Storage
process.env.STORAGE_DRIVER = "disk";

// Mail
process.env.MAIL_DRIVER = "ethereal";
