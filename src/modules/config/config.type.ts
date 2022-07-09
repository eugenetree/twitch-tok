export enum ENV_VARS {
  CLIENT_ID = 'TWITCH_CLIENT_ID',
  CLIENT_SECRET = 'TWITCH_CLIENT_SECRET',
  GAMES_IDS = 'TWITCH_GAMES_IDS',
  TIKTOK_COOKIES = 'TIKTOK_COOKIES'
}

export abstract class ConfigService {
  abstract getGamesIds(): Array<string>;
  abstract getTikTokCookies(gameId: string): Record<string, unknown>;
}