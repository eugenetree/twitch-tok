import { Injectable, LoggerService, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpRequestConfig, HttpRequstReturnType, HttpService } from 'src/modules/http/http.type';
import { TwitchApiService } from './api.type';
import { TWITCH_LINKS } from './api.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TwitchVideo } from '../../entities/video.entity';
import { prepareTwitchVideos, TwitchVideoDto } from './video.dto';
import { ENV_VARS } from '../config/config.type';

@Injectable()
export class DefaultTwitchApiService implements TwitchApiService {
  private token: string;
  private readonly clientId: string = this.configService.get(ENV_VARS.CLIENT_ID) as string;
  private readonly clientSecret: string = this.configService.get(ENV_VARS.CLIENT_SECRET) as string;

  constructor(
    @InjectRepository(TwitchVideo) private videosRepository: Repository<TwitchVideo>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) { }


  public async getNewClips({ gameId }: { gameId: string }): Promise<Array<TwitchVideoDto>> {
    try {
      const config = await this.getConfigForAuthedRequest();
    const { data: { data: videosFromResponse } } = await this.httpService.get(TWITCH_LINKS.GET_LAST_CLIPS, {
      ...config, params: {
        game_id: gameId,
        startedAt: new Date(Number(new Date()) - 3600 * 1000 * 24).toISOString(),
        first: 100,
      }
    });

    const preparedVideos = prepareTwitchVideos(videosFromResponse);
    console.log('preparedVideos', preparedVideos);
    
    const notPresentedInDbVideos = await this.getNotPresentedInDbVideos(preparedVideos);
    console.log('notPresentedInDbVideos', notPresentedInDbVideos);

    return notPresentedInDbVideos;
    } catch(err) {
      console.log(err);
      return []
    }
  }


  private async getNotPresentedInDbVideos(videos: Array<TwitchVideoDto>): Promise<any> {
    const filteredVideos: Array<TwitchVideoDto> = [];

    for (const video of videos) {
      console.log('---');
      const isVideoPresentedInDb = await this.videosRepository.findOne({ where: { remoteClipUrl: video.url } });
      if (!isVideoPresentedInDb) filteredVideos.push(video);
      console.log(isVideoPresentedInDb);
      
    }
    return filteredVideos;
  }

  private async getConfigForAuthedRequest(): Promise<HttpRequestConfig> {
    if (this.token) {
      return {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Client-Id': this.clientId,
        },
      };
    }

    await this.fetchToken();
    return {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Client-Id': this.clientId,
      },
    };
  }

  private async fetchToken() {
    const { data: { accessToken } } = await this.httpService.post(TWITCH_LINKS.LOGIN, {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'client_credentials',
    });
    this.token = accessToken || null;
  }
}