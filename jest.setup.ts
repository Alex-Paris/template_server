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
