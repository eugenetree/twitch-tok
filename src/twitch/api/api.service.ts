import { Injectable, LoggerService, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';
import { HttpRequestConfig, HttpRequstReturnType, HttpService } from 'src/http/http.type';
import { StorageService } from 'src/storage/storage.type';
import { TwitchApiService } from './api.type';
import { TWITCH_LINKS } from './api.constants';
import { DefaultHttpService } from 'src/http/http.service';

const URL = 'https://webhook.site/cf076c0f-5535-42b4-984d-a3ce50223ca5';

@Injectable()
export class DefaultTwitchApiService implements TwitchApiService, OnModuleInit {
  private token: string;
  // private tokenFetchStatus: 'loading' | 'success' | 'failed';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    // private readonly loggerService: LoggerService,
  ) {
  }


  async onModuleInit() {
    await this.fetchToken();
  }

  private async getConfigForAuthedRequest(): Promise<HttpRequestConfig> {
    if (this.token) {
      return {
        headers: {
          Authorization: `Bearer ${this.token}`
        },
      };
    }

    await this.fetchToken();
    return {
      headers: {
        Authorization: `Bearer ${this.token}`
      },
    };
  }

  private async fetchToken() {
    const { data: { accessToken } } = await this.httpService.post(TWITCH_LINKS.LOGIN, {
      client_id: this.configService.get('TWITCH_CLIENT_ID'),
      client_secret: this.configService.get('TWITCH_CLIENT_SECRET'),
      grant_type: 'client_credentials',
    });
    this.token = accessToken || null;
  }


  public async getLastClips(): Promise<HttpRequstReturnType> {
    const config = await this.getConfigForAuthedRequest();
    return this.httpService.get(TWITCH_LINKS.GET_LAST_CLIPS, { ...config });
  }
}
