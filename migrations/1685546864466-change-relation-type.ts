import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeRelationType1685546864466 implements MigrationInterface {
    name = 'ChangeRelationType1685546864466'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation" DROP CONSTRAINT "FK_d1785b675931bda956358a42666"`);
        await queryRunner.query(`ALTER TABLE "conversation" ALTER COLUMN "last_activity_time" SET DEFAULT 'now()'`);
        await queryRunner.query(`ALTER TABLE "conversation" DROP CONSTRAINT "REL_d1785b675931bda956358a4266"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation" ADD CONSTRAINT "REL_d1785b675931bda956358a4266" UNIQUE ("avatar_id")`);
        await queryRunner.query(`ALTER TABLE "conversation" ALTER COLUMN "last_activity_time" SET DEFAULT '2023-05-31 21:24:52.900459+07'`);
        await queryRunner.query(`ALTER TABLE "conversation" ADD CONSTRAINT "FK_d1785b675931bda956358a42666" FOREIGN KEY ("avatar_id") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
