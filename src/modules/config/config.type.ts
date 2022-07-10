import { TwitchVideoLanguages } from "src/entities/video.type";

export enum ENV_VARS {
  CLIENT_ID = 'TWITCH_CLIENT_ID',
  CLIENT_SECRET = 'TWITCH_CLIENT_SECRET',
  GAMES_IDS = 'TWITCH_GAMES_IDS',
  TIKTOK_COOKIES = 'TIKTOK_COOKIES',
  ENV = 'ENV',
}

export abstract class ConfigService {
  abstract getCurrentEnv(): 'PROD' | 'DEV';
  abstract getGamesIds(): Array<string>;
  abstract getTikTokCookies(gameId: string, language: TwitchVideoLanguages): Record<string, unknown>;
}