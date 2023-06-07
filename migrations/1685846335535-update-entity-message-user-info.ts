import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateEntityMessageUserInfo1685846335535 implements MigrationInterface {
    name = 'UpdateEntityMessageUserInfo1685846335535'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."message_user_info_status_enum" AS ENUM('READ', 'UNREAD')`);
        await queryRunner.query(`CREATE TYPE "public"."message_user_info_reaction_enum" AS ENUM('LIKE', 'LOVE', 'ANGRY')`);
        await queryRunner.query(`CREATE TABLE "message_user_info" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL DEFAULT '1', "id" SERIAL NOT NULL, "status" "public"."message_user_info_status_enum" NOT NULL, "reaction" "public"."message_user_info_reaction_enum", "user_id" integer NOT NULL, "message_id" integer NOT NULL, CONSTRAINT "PK_7a26d48407fdade837f07328b6a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_7d21074cf540154ab81a1159372"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "REL_7d21074cf540154ab81a115937"`);
        await queryRunner.query(`ALTER TABLE "conversation" ALTER COLUMN "last_activity_time" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_7d21074cf540154ab81a1159372" FOREIGN KEY ("file_id") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message_user_info" ADD CONSTRAINT "FK_daffaab1093fb3fc5f9e34bc524" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message_user_info" ADD CONSTRAINT "FK_53ad61b86cbe37e8c7bba0e1d81" FOREIGN KEY ("message_id") REFERENCES "message"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conversation" ADD CONSTRAINT "FK_d1785b675931bda956358a42666" FOREIGN KEY ("avatar_id") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation" DROP CONSTRAINT "FK_d1785b675931bda956358a42666"`);
        await queryRunner.query(`ALTER TABLE "message_user_info" DROP CONSTRAINT "FK_53ad61b86cbe37e8c7bba0e1d81"`);
        await queryRunner.query(`ALTER TABLE "message_user_info" DROP CONSTRAINT "FK_daffaab1093fb3fc5f9e34bc524"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_7d21074cf540154ab81a1159372"`);
        await queryRunner.query(`ALTER TABLE "conversation" ALTER COLUMN "last_activity_time" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "REL_7d21074cf540154ab81a115937" UNIQUE ("file_id")`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_7d21074cf540154ab81a1159372" FOREIGN KEY ("file_id") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`DROP TABLE "message_user_info"`);
        await queryRunner.query(`DROP TYPE "public"."message_user_info_reaction_enum"`);
        await queryRunner.query(`DROP TYPE "public"."message_user_info_status_enum"`);
    }

}
