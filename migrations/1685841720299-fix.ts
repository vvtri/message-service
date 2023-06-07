import { MigrationInterface, QueryRunner } from "typeorm";

export class Fix1685841720299 implements MigrationInterface {
    name = 'Fix1685841720299'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation" ALTER COLUMN "last_activity_time" SET DEFAULT 'CURRENT_TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation" ALTER COLUMN "last_activity_time" SET DEFAULT '2023-05-31 22:29:18.076656+07'`);
    }

}
