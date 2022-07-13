import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from 'src/modules/http/http.type';
import { Repository } from 'typeorm';
import { TwitchApiService } from '../twitch-api/api.type';
import { TwitchVideoHandlerService } from '../twitch-video-handler/video-handler.type';
import { TwitchVideoDto } from '../twitch-api/video.dto';
import { TwitchVideo } from '../../entities/video.entity';
import { TwitchVideoStatuses } from '../../entities/video.type';
import { TwitchManagerService } from './manager.type';
import { ConfigService } from '../config/config.type';

@Injectable()
export class DefaultTwitchManagerService implements TwitchManagerService, OnModuleInit {
  gamesIds: Array<string> = this.configService.getGamesIds();

  constructor(
    @InjectRepository(TwitchVideo) private videosRepository: Repository<TwitchVideo>,
    private readonly twitchApiService: TwitchApiService,
    private readonly twitchVideoHandlerService: TwitchVideoHandlerService,
    private configService: ConfigService,
  ) { }


  @Cron(CronExpression.EVERY_HOUR)
  public async checkForNewClips(): Promise<void> {
    for (const gameId of this.gamesIds) {
      const newVideos = await this.twitchApiService.getNewClips({ gameId });
      if (!newVideos.length) return;

      const dbVideos = await this.addVideosToDb(newVideos, gameId);
      const dbVideosIds = dbVideos.map((video) => video.id);
      await this.twitchVideoHandlerService.addVideosToQueue(dbVideosIds);
    }
  }


  async onModuleInit() {
    await this.runProcessingForIdleVideos();
    await this.checkForNewClips();
  }


  private async runProcessingForIdleVideos() {
    const videosToProcess = await (await this.videosRepository.find({ where: { status: TwitchVideoStatuses.IDLE } }))
    this.twitchVideoHandlerService.addVideosToQueue(videosToProcess.map((video) => video.id));
  }

  private addVideosToDb(videos: Array<TwitchVideoDto>, gameId: string) {
    return Promise.all(videos.map((video) => this.videosRepository.save({
      title: video.title,
      creatorName: video.creatorName,
      lang: video.language,
      remoteClipUrl: video.url,
      status: TwitchVideoStatuses.IDLE,
      gameId,
    }))).then((videos) => videos.sort((a, b) => a.id - b.id));
  }
}
