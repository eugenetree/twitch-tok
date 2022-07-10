import { Injectable } from '@nestjs/common';
import { ConfigService as CustomConfigService, ENV_VARS } from './config.type';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { TwitchVideoLanguages } from 'src/entities/video.type';

@Injectable()
export class DefaultConfigService implements CustomConfigService {
  constructor(private nestConfigService: NestConfigService) { }

  getGamesIds(): Array<string> {
    const stringifiedIds = this.nestConfigService.get(ENV_VARS.GAMES_IDS);
    return stringifiedIds.split(',');
  }

  getTikTokCookies(gameId: string, language: TwitchVideoLanguages): Record<string, unknown> {
    const stringifiedCookiesForSpecifigLanguage = this.nestConfigService.get(`${ENV_VARS.TIKTOK_COOKIES}_${gameId}_${language.toUpperCase()}`)
    if (stringifiedCookiesForSpecifigLanguage) return JSON.parse(stringifiedCookiesForSpecifigLanguage);

    const stringifiedCookies = this.nestConfigService.get(ENV_VARS.TIKTOK_COOKIES + `_${gameId}`);
    return JSON.parse(stringifiedCookies);
  }
}
