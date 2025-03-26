import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsers1743008462922 implements MigrationInterface {
    name = 'AddUsers1743008462922';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`firstName\` text NOT NULL, \`lastName\` text NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` text NULL DEFAULT NULL, \`mobileNumber\` text NULL DEFAULT NULL, \`metadata\` json NULL DEFAULT NULL, \`blacklisted\` tinyint NOT NULL DEFAULT '0', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL DEFAULT NULL, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
    }
}
