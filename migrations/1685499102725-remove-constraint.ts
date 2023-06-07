import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveConstraint1685499102725 implements MigrationInterface {
    name = 'RemoveConstraint1685499102725'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation" DROP CONSTRAINT "FK_d1785b675931bda956358a42666"`);
        await queryRunner.query(`ALTER TABLE "conversation" ALTER COLUMN "last_activity_time" SET DEFAULT 'now()'`);
        await queryRunner.query(`ALTER TABLE "conversation" ALTER COLUMN "avatar_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "conversation_member" DROP CONSTRAINT "FK_223196c13f3ca58fee8689e388c"`);
        await queryRunner.query(`ALTER TABLE "conversation_member" ALTER COLUMN "role" SET DEFAULT 'MEMBER'`);
        await queryRunner.query(`ALTER TABLE "conversation_member" ALTER COLUMN "added_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "conversation" ADD CONSTRAINT "FK_d1785b675931bda956358a42666" FOREIGN KEY ("avatar_id") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conversation_member" ADD CONSTRAINT "FK_223196c13f3ca58fee8689e388c" FOREIGN KEY ("added_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation_member" DROP CONSTRAINT "FK_223196c13f3ca58fee8689e388c"`);
        await queryRunner.query(`ALTER TABLE "conversation" DROP CONSTRAINT "FK_d1785b675931bda956358a42666"`);
        await queryRunner.query(`ALTER TABLE "conversation_member" ALTER COLUMN "added_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "conversation_member" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "conversation_member" ADD CONSTRAINT "FK_223196c13f3ca58fee8689e388c" FOREIGN KEY ("added_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conversation" ALTER COLUMN "avatar_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "conversation" ALTER COLUMN "last_activity_time" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "conversation" ADD CONSTRAINT "FK_d1785b675931bda956358a42666" FOREIGN KEY ("avatar_id") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
