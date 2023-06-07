import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveConstraintFile1685543019149 implements MigrationInterface {
    name = 'RemoveConstraintFile1685543019149'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation" ALTER COLUMN "last_activity_time" SET DEFAULT 'now()'`);
        await queryRunner.query(`ALTER TABLE message ALTER COLUMN file_id DROP NOT NULL;`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation" ALTER COLUMN "last_activity_time" SET DEFAULT '2023-05-31 09:12:46.9024+07'`);
    }

}
