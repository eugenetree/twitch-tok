import { Injectable } from '@nestjs/common';
import { ConfigService as CustomConfigService, ENV_VARS } from './config.type';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class DefaultConfigService implements CustomConfigService {
  constructor(private nestConfigService: NestConfigService) {}
  
  getGamesIds(): Array<string> {
    const stringifiedIds = this.nestConfigService.get(ENV_VARS.GAMES_IDS);
    return stringifiedIds.split(',');
  }

  getTikTokCookies(gameId: string): Record<string, unknown> {
    const stringifiedCookies = this.nestConfigService.get(ENV_VARS.TIKTOK_COOKIES + `_${gameId}`);
    return JSON.parse(stringifiedCookies);      
  }
}
