export enum ENV_VARS {
  CLIENT_ID = 'TWITCH_CLIENT_ID',
  CLIENT_SECRET = 'TWITCH_CLIENT_SECRET',
  TWITCH_GAMES_CONFIGS = 'TWITCH_GAMES_CONFIGS',
  TIKTOK_COOKIES = 'TIKTOK_COOKIES',
  ENV = 'ENV',
}

export type TwitchGameConfig = {
  gameId: string;
  language: string;
  minViewsCount: number;
}

export type TwitchGamesConfigsAsArray = Array<TwitchGameConfig>;
export type TwitchGamesConfigsAsObject = Record<string, TwitchGameConfig>;

export abstract class ConfigService {
  abstract getCurrentEnv: () => 'PROD' | 'DEV';
  abstract getTwitchGamesConfigsAsArray: () => TwitchGamesConfigsAsArray;
  abstract getTwitchGamesConfigsAsObject: () => TwitchGamesConfigsAsObject;
  abstract getTikTokCookies: (gameId: string, languageFromConfig: string) => Record<string, unknown>;
}