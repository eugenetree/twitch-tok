import { MigrationInterface, QueryRunner } from "typeorm";

export class init1658447778880 implements MigrationInterface {
    name = 'init1658447778880'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`twitch_video\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`creatorName\` varchar(255) NOT NULL, \`remoteClipUrl\` varchar(255) NULL, \`localVideoPath\` varchar(255) NULL, \`status\` varchar(255) NOT NULL, \`languageOriginal\` varchar(255) NOT NULL, \`languageFromConfig\` varchar(255) NOT NULL, \`gameId\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_c5fd8d9df8cd5c001469e31d74\` (\`remoteClipUrl\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`tiktok_upload\` (\`id\` int NOT NULL AUTO_INCREMENT, \`gameId\` varchar(255) NOT NULL, \`language\` varchar(255) NOT NULL, \`lastUploadDate\` datetime NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`tiktok_upload\``);
        await queryRunner.query(`DROP INDEX \`IDX_c5fd8d9df8cd5c001469e31d74\` ON \`twitch_video\``);
        await queryRunner.query(`DROP TABLE \`twitch_video\``);
    }

}
