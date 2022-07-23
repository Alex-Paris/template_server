import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateInitialTemplate1657764542737 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "users",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "name",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "email",
            type: "varchar",
            isUnique: true,
          },
          {
            name: "password",
            type: "varchar",
          },
          {
            name: "avatar",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "now()",
          },
        ],
      })
    );

    await queryRunner.createTable(
      new Table({
        name: "users_tokens",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "refresh_token",
            type: "varchar",
          },
          {
            name: "type",
            type: "integer",
          },
          {
            name: "expires_at",
            type: "timestamp",
          },
          {
            name: "revoked_by_ip",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "revoked_at",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "revoked_reason",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "created_by_ip",
            type: "varchar",
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "replaced_token_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "user_id",
            type: "uuid",
          },
        ],
        foreignKeys: [
          {
            name: "FK_replacedTokenId",
            columnNames: ["replaced_token_id"],
            referencedTableName: "users_tokens",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
          },
          {
            name: "FK_userId",
            columnNames: ["user_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("users");
    await queryRunner.dropTable("users_tokens");
  }
}
