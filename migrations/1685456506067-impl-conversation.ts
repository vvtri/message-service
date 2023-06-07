import { MigrationInterface, QueryRunner } from "typeorm";

export class ImplConversation1685456506067 implements MigrationInterface {
    name = 'ImplConversation1685456506067'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."message_read_info_status_enum" AS ENUM('READ', 'UNREAD')`);
        await queryRunner.query(`CREATE TABLE "message_read_info" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL DEFAULT '1', "id" SERIAL NOT NULL, "status" "public"."message_read_info_status_enum" NOT NULL, "user_id" integer NOT NULL, "message_id" integer NOT NULL, CONSTRAINT "PK_04e8a1a1022d93126cb1ed21902" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."message_type_enum" AS ENUM('TEXT', 'FILE', 'IMAGE', 'CALL')`);
        await queryRunner.query(`CREATE TABLE "message" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL DEFAULT '1', "id" SERIAL NOT NULL, "content" character varying, "type" "public"."message_type_enum" NOT NULL, "user_id" integer NOT NULL, "conversation_id" integer NOT NULL, "file_id" integer NOT NULL, CONSTRAINT "REL_7d21074cf540154ab81a115937" UNIQUE ("file_id"), CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "conversation" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL DEFAULT '1', "id" SERIAL NOT NULL, "name" character varying, "is_group" boolean NOT NULL, "last_activity_time" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "avatar_id" integer NOT NULL, CONSTRAINT "REL_d1785b675931bda956358a4266" UNIQUE ("avatar_id"), CONSTRAINT "PK_864528ec4274360a40f66c29845" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."conversation_member_role_enum" AS ENUM('ADMIN', 'MEMBER')`);
        await queryRunner.query(`CREATE TABLE "conversation_member" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL DEFAULT '1', "id" SERIAL NOT NULL, "role" "public"."conversation_member_role_enum" NOT NULL, "user_id" integer NOT NULL, "added_id" integer NOT NULL, "conversation_id" integer NOT NULL, CONSTRAINT "PK_ed07d3bc360f4e68836841b8358" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "message_read_info" ADD CONSTRAINT "FK_bf60c0ff5bfe28df875a0a5b93d" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message_read_info" ADD CONSTRAINT "FK_9dd6fa1c3d228c80cc53ade7aac" FOREIGN KEY ("message_id") REFERENCES "message"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_54ce30caeb3f33d68398ea10376" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_7fe3e887d78498d9c9813375ce2" FOREIGN KEY ("conversation_id") REFERENCES "conversation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_7d21074cf540154ab81a1159372" FOREIGN KEY ("file_id") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conversation" ADD CONSTRAINT "FK_d1785b675931bda956358a42666" FOREIGN KEY ("avatar_id") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conversation_member" ADD CONSTRAINT "FK_b31b403f2e9c21a4a48460b8ed9" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conversation_member" ADD CONSTRAINT "FK_223196c13f3ca58fee8689e388c" FOREIGN KEY ("added_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conversation_member" ADD CONSTRAINT "FK_60a5cedcd205ed3686ad16d6311" FOREIGN KEY ("conversation_id") REFERENCES "conversation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation_member" DROP CONSTRAINT "FK_60a5cedcd205ed3686ad16d6311"`);
        await queryRunner.query(`ALTER TABLE "conversation_member" DROP CONSTRAINT "FK_223196c13f3ca58fee8689e388c"`);
        await queryRunner.query(`ALTER TABLE "conversation_member" DROP CONSTRAINT "FK_b31b403f2e9c21a4a48460b8ed9"`);
        await queryRunner.query(`ALTER TABLE "conversation" DROP CONSTRAINT "FK_d1785b675931bda956358a42666"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_7d21074cf540154ab81a1159372"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_7fe3e887d78498d9c9813375ce2"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_54ce30caeb3f33d68398ea10376"`);
        await queryRunner.query(`ALTER TABLE "message_read_info" DROP CONSTRAINT "FK_9dd6fa1c3d228c80cc53ade7aac"`);
        await queryRunner.query(`ALTER TABLE "message_read_info" DROP CONSTRAINT "FK_bf60c0ff5bfe28df875a0a5b93d"`);
        await queryRunner.query(`DROP TABLE "conversation_member"`);
        await queryRunner.query(`DROP TYPE "public"."conversation_member_role_enum"`);
        await queryRunner.query(`DROP TABLE "conversation"`);
        await queryRunner.query(`DROP TABLE "message"`);
        await queryRunner.query(`DROP TYPE "public"."message_type_enum"`);
        await queryRunner.query(`DROP TABLE "message_read_info"`);
        await queryRunner.query(`DROP TYPE "public"."message_read_info_status_enum"`);
    }

}
