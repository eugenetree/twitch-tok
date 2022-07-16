import { Injectable, LoggerService, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpRequestConfig, HttpRequstReturnType, HttpService } from 'src/modules/http/http.type';
import { TwitchApiService } from './twitch-api.type';
import { TWITCH_LINKS } from './twitch-api.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TwitchVideo } from '../../entities/video.entity';
import { TwitchApiValidator } from './twitch-api.validator';
import { ENV_VARS, TwitchGameConfig } from '../config/config.type';
import { TwitchVideoDto } from './twitch-api.map';

@Injectable()
export class DefaultTwitchApiService implements TwitchApiService {
  private token: string;
  private readonly clientId: string = this.configService.get(ENV_VARS.CLIENT_ID) as string;
  private readonly clientSecret: string = this.configService.get(ENV_VARS.CLIENT_SECRET) as string;

  constructor(
    @InjectRepository(TwitchVideo) private videosRepository: Repository<TwitchVideo>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly twitchApiValidator: TwitchApiValidator,
  ) { }


  public async getNewClips({ gameId, language, minViewsCount }: TwitchGameConfig): Promise<Array<TwitchVideoDto>> {
    const config = await this.getConfigForAuthedRequest();
    const result: Array<TwitchVideoDto> = [];

    const getPaginatedClips = async (nextPageCursor?: string) => {
      const { data: { data: videosFromResponse, pagination } } =
        await this.httpService.get(TWITCH_LINKS.GET_LAST_CLIPS, {
          ...config, params: {
            game_id: gameId,
            startedAt: new Date(Number(new Date()) - 3600 * 1000 * 24).toISOString(),
            first: 100, after: nextPageCursor
          }
        });

      const validVideos = this.twitchApiValidator.validateVideos(videosFromResponse, { language, minViewsCount });
      const notPresentedInDbVideos = await this.getNotPresentedInDbVideos(validVideos);
      result.push(...notPresentedInDbVideos);

      const hasLastVideoRequiredViewsAmount =
        this.twitchApiValidator.validateVideo(videosFromResponse[videosFromResponse.length - 1], { language: "all", minViewsCount });

      if (hasLastVideoRequiredViewsAmount) {
        if (pagination?.cursor) await getPaginatedClips(pagination?.cursor)
      }
    }

    await getPaginatedClips();

    return result;
  }


  private async getNotPresentedInDbVideos(videos: Array<TwitchVideoDto>): Promise<Array<TwitchVideoDto>> {
    const filteredVideos: Array<TwitchVideoDto> = [];
    for (const video of videos) {
      const isVideoPresentedInDb = await this.videosRepository.findOne({ where: { remoteClipUrl: video.url } });
      if (!isVideoPresentedInDb) filteredVideos.push(video);
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