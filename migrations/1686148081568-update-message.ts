import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateMessage1686148081568 implements MigrationInterface {
    name = 'UpdateMessage1686148081568'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_54ce30caeb3f33d68398ea10376"`);
        await queryRunner.query(`ALTER TYPE "public"."message_type_enum" RENAME TO "message_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."message_type_enum" AS ENUM('TEXT', 'FILE', 'IMAGE', 'CALL', 'SYSTEM')`);
        await queryRunner.query(`ALTER TABLE "message" ALTER COLUMN "type" TYPE "public"."message_type_enum" USING "type"::"text"::"public"."message_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."message_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "message" ALTER COLUMN "user_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."conversation_member_role_enum" RENAME TO "conversation_member_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."conversation_member_role_enum" AS ENUM('OWNER', 'ADMIN', 'MEMBER')`);
        await queryRunner.query(`ALTER TABLE "conversation_member" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "conversation_member" ALTER COLUMN "role" TYPE "public"."conversation_member_role_enum" USING "role"::"text"::"public"."conversation_member_role_enum"`);
        await queryRunner.query(`ALTER TABLE "conversation_member" ALTER COLUMN "role" SET DEFAULT 'MEMBER'`);
        await queryRunner.query(`DROP TYPE "public"."conversation_member_role_enum_old"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e59c74068436e4162e65439978" ON "message_user_info" ("message_id", "user_id") WHERE deleted_at is null`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_54ce30caeb3f33d68398ea10376" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_54ce30caeb3f33d68398ea10376"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e59c74068436e4162e65439978"`);
        await queryRunner.query(`CREATE TYPE "public"."conversation_member_role_enum_old" AS ENUM('ADMIN', 'MEMBER')`);
        await queryRunner.query(`ALTER TABLE "conversation_member" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "conversation_member" ALTER COLUMN "role" TYPE "public"."conversation_member_role_enum_old" USING "role"::"text"::"public"."conversation_member_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "conversation_member" ALTER COLUMN "role" SET DEFAULT 'MEMBER'`);
        await queryRunner.query(`DROP TYPE "public"."conversation_member_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."conversation_member_role_enum_old" RENAME TO "conversation_member_role_enum"`);
        await queryRunner.query(`ALTER TABLE "message" ALTER COLUMN "user_id" SET NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."message_type_enum_old" AS ENUM('TEXT', 'FILE', 'IMAGE', 'CALL')`);
        await queryRunner.query(`ALTER TABLE "message" ALTER COLUMN "type" TYPE "public"."message_type_enum_old" USING "type"::"text"::"public"."message_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."message_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."message_type_enum_old" RENAME TO "message_type_enum"`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_54ce30caeb3f33d68398ea10376" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
