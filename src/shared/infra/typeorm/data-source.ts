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
export const pgDataSource = new DataSource({
  type: "postgres",
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  username: process.env.PG_USER,
  password: process.env.PG_PASS,
  database: process.env.PG_DB,
  useUTC: true,
  dropSchema: process.env.NODE_ENV !== "production",
  migrationsTableName: "_migrations",
  migrationsRun: process.env.NODE_ENV !== "test",
  migrations: ["./src/shared/infra/typeorm/migrations/*{.ts,.js}"],
  entities: ["./src/modules/**/infra/typeorm/entities/*.ts"],
});
