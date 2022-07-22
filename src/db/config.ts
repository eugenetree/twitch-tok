import { TwitchVideo } from "../entities/video.entity";
import { TiktokUpload } from "../modules/tiktok-upload/tiktok-upload.entity";
import { DataSource, DataSourceOptions } from "typeorm";
import { init1658447778880 } from "./migrations/1658447778880-init";
import 'dotenv/config';

export const dbConfig: DataSourceOptions = {
  type: 'mysql',
  host: 'twitch_tok_db',
  port: 3306,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  entities: [TwitchVideo, TiktokUpload],
  migrations: [init1658447778880],
  synchronize: false,
}

export default new DataSource(dbConfig);