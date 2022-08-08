import { DataSource } from "typeorm";

/**
 * Postgres typeORM datasource. Uses .env file to fill datasource options.
 * @production migration running automatically.
 * @development migration running automatically. Drop schema is enabled to clean
 * database in every node run and let seeds repopulate it.
 * @test migration running inactivated to ensure every test controllers to
 * execute it. Drop schema is enabled to clean database in every node run and
 * let test controllers to repopulate it.
 */
export const databaseSource = new DataSource({
  type: "postgres",
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  database: process.env.PG_DB,
  username: process.env.PG_USER,
  password: process.env.PG_PASS,
  useUTC: true,
  connectTimeoutMS: 20 * 1000,
  dropSchema: process.env.NODE_ENV !== "production",
  migrationsTableName: "_migrations",
  migrationsRun: process.env.NODE_ENV !== "test",
  migrations: ["./src/shared/infra/typeorm/migrations/*{.ts,.js}"],
  entities: ["./src/modules/**/infra/typeorm/entities/*.ts"],
});

/**
 * Mongo typeORM datasource. Uses .env file to fill datasource options.
 * @production works normal.
 * @development Drop schema is enabled to clean database in every node run.
 * @test Drop schema is enabled to clean database in every node run and
 * let test controllers to repopulate it.
 */
export const queueSource = new DataSource({
  type: "mongodb",
  host: process.env.MONGO_HOST,
  port: Number(process.env.MONGO_PORT),
  database: process.env.MONGO_DB,
  username: process.env.MONGO_USER,
  password: process.env.MONGO_PASS,
  connectTimeoutMS: 20 * 1000,
  dropSchema: process.env.NODE_ENV !== "production",
  useUnifiedTopology: true,
  entities: ["./src/modules/**/infra/typeorm/schemas/*.ts"],
});
