import { Injectable } from '@nestjs/common';
import { ConfigService as CustomConfigService, ENV_VARS, TwitchGamesConfigsAsArray, TwitchGamesConfigsAsObject } from './config.type';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { array, number, object, Schema, string } from 'yup';

const gamesConfigSchema: Schema<TwitchGamesConfigsAsArray> = array().min(1).required().of(
  object({
    gameId: string().required(),
    language: string().required(),
    minViewsCount: number().required(),
  }))


const getGamesConfigsAsObject = (gamesConfigs: TwitchGamesConfigsAsArray): TwitchGamesConfigsAsObject => {
  let resultObject = {};
  gamesConfigs.forEach((config) => {
    resultObject[config.gameId] = config;
  })

  return resultObject;
}

// TODO: check more info about using types like Type['someKeyOfThisType'] and rework all code to this structure
@Injectable()
export class DefaultConfigService implements CustomConfigService {
  constructor(private nestConfigService: NestConfigService) { }

  getCurrentEnv(): 'PROD' | 'DEV' {
    return this.nestConfigService.get(ENV_VARS.ENV) === 'PROD' ? 'PROD' : 'DEV'
  }

  getTwitchGamesConfigsAsArray: CustomConfigService['getTwitchGamesConfigsAsArray'] = () => {
    try {
      const gamesConfigs = JSON.parse(this.nestConfigService.get(ENV_VARS.TWITCH_GAMES_CONFIGS) || "");
      const validConfigs = gamesConfigSchema.validateSync(gamesConfigs);
      return validConfigs;
    } catch (err) {
      throw new Error('Init error, no twitchGamesConfigs was provided');
    }
  }

  getTwitchGamesConfigsAsObject: CustomConfigService['getTwitchGamesConfigsAsObject'] = () => {
    try {
      const gamesConfigs = JSON.parse(this.nestConfigService.get(ENV_VARS.TWITCH_GAMES_CONFIGS) || "");
      const validConfigs = gamesConfigSchema.validateSync(gamesConfigs);
      return getGamesConfigsAsObject(validConfigs);
    } catch (err) {
      throw new Error('Init error, no twitchGamesConfigs was provided');
    }
  }

  getTikTokCookies: CustomConfigService['getTikTokCookies'] = (gameId, languageFromConfig) => {
    const stringifiedCookiesForSpecifigLanguage = this.nestConfigService.get(`${ENV_VARS.TIKTOK_COOKIES}_${gameId}_${languageFromConfig.toUpperCase()}`)
    if (stringifiedCookiesForSpecifigLanguage) return JSON.parse(stringifiedCookiesForSpecifigLanguage);

    const stringifiedCookies = this.nestConfigService.get(ENV_VARS.TIKTOK_COOKIES + `_${gameId}`);
    return JSON.parse(stringifiedCookies);
  }
}
