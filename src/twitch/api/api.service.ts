import { Injectable, LoggerService, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpRequestConfig, HttpRequstReturnType, HttpService } from 'src/http/http.type';
import { TwitchApiService } from './api.type';
import { TWITCH_ENV_VARS, TWITCH_LINKS } from './api.constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TwitchVideo } from '../video.entity';
import { TwitchVideoDto, VideoDto } from '../video.dto';
import { validate, validateSync } from 'class-validator';

const URL = 'https://webhook.site/cf076c0f-5535-42b4-984d-a3ce50223ca5';

@Injectable()
export class DefaultTwitchApiService implements TwitchApiService, OnModuleInit {
  private token: string = 'o82p5l1w5ur9r5ertlv4n95rzk5vl9';
  private readonly clientId: string = this.configService.get(TWITCH_ENV_VARS.CLIENT_ID);
  private readonly clientSecret: string = this.configService.get(TWITCH_ENV_VARS.CLIENT_SECRET);
  // private tokenFetchStatus: 'loading' | 'success' | 'failed';

  constructor(
    @InjectRepository(TwitchVideo)
    private videosRepository: Repository<TwitchVideo>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
  }


  async onModuleInit() {
    // await this.getNewClips();
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

  private async getNotPresentedInDbVideos(videos: Array<any>): Promise<any> {
    const resultVideos = [];

    // for (const video of videos) {
    // if (typeof video !== 'object' || typeof video == null || ) continue;
    // await this.videosRepository.find()
    // }
  }

  private getPreparedVideo = (video) => ({
    title: video.title,
    creatorName: video.creatorName,
    remoteClipUrl: 'https://www.twitch.tv/paradeev1ch/clip/ConcernedLitigiousSalmonPeteZaroll-O8yo9W2L8OZEKhV2',
    localVideoPath: null,
    status: 'idle',
  })

  public async getNewClips( ): Promise<Array<TwitchVideoDto>> {
    const config = await this.getConfigForAuthedRequest();
    const { data: {data: allVideos} } = await this.httpService.get(TWITCH_LINKS.GET_LAST_CLIPS, { ...config, params: { gameId: '509658' } });
    
    const prep = this.getPreparedVideo(allVideos[0])
    console.log(prep);
    
    return [prep];
  }
}