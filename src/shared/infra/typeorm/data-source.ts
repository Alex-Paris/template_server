import { DataSource } from "typeorm";

export const pgDataSource = new DataSource({
  type: "postgres",
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  username: process.env.PG_USER,
  password: process.env.PG_PASS,
  database: process.env.PG_DB,
  migrationsTableName: "_migrations",
  migrationsRun: true,
  migrations: ["./src/shared/infra/typeorm/migrations/*{.ts,.js}"],
  entities: ["./src/modules/**/infra/typeorm/entities/*.ts"],
});
