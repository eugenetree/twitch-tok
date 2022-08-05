import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TwitchApiService } from '../twitch-api/twitch-api.type';
import { TwitchVideoHandlerService } from '../twitch-video-handler/video-handler.type';
import { TwitchVideo } from '../../entities/video.entity';
import { TwitchVideoStatuses } from '../../entities/video.type';
import { TwitchManagerService } from './manager.type';
import { ConfigService, TwitchGamesConfigsAsArray } from '../config/config.type';
import { TwitchVideoDto } from '../twitch-api/twitch-api.map';
import { TiktokUploadService } from '../tiktok-upload/tiktok-upload.type';

@Injectable()
export class DefaultTwitchManagerService implements TwitchManagerService, OnModuleInit {
  gamesConfigs: TwitchGamesConfigsAsArray = this.configService.getTwitchGamesConfigsAsArray();
  isSwapped: boolean = false;

  constructor(
    @InjectRepository(TwitchVideo) private videosRepository: Repository<TwitchVideo>,
    private readonly twitchApiService: TwitchApiService,
    private readonly twitchVideoHandlerService: TwitchVideoHandlerService,
    private tiktokUploadService: TiktokUploadService,
    private configService: ConfigService,
  ) { }


  async onModuleInit() {
    // await this.runProcessingForIdleVideos();
    await this.checkForNewClips();
  }


  @Cron(CronExpression.EVERY_HOUR)
  public async checkForNewClips(): Promise<void> {
    for (const gameConfig of this.gamesConfigs) {
      const newVideos = await this.twitchApiService.getNewClips(gameConfig);
      if (!newVideos.length) continue;

      const dbVideos = await this.addVideosToDb(newVideos, gameConfig.gameId);
      // const dbVideosIds = dbVideos.map((video) => video.id);
      // await this.twitchVideoHandlerService.addVideosToQueue(dbVideosIds);
    }
  }


  @Cron(CronExpression.EVERY_MINUTE)
  private async check() {
    if (this.configService.isBusy()) {
      return;
    };

    try { // TODO: rework
      await this.twitchVideoHandlerService.createVideo();
    } catch (err) {
      console.log(new Date(),err);
    }

    try {
      await this.tiktokUploadService.uploadVideosIfAvailable();
    } catch (err) {
      console.log(new Date(),err);
    }
  }

  private async runProcessingForIdleVideos() {
    // const videosToProcess = await (await this.videosRepository.find({ where: { status: TwitchVideoStatuses.IDLE } }))
    // this.twitchVideoHandlerService.addVideosToQueue(videosToProcess.map((video) => video.id));
  }

  private addVideosToDb(videos: Array<TwitchVideoDto>, gameId: string) {
    videos.map(video => console.log(new Date(),video));


    return Promise.all(videos.map((video) => this.videosRepository.save({
      title: video.title,
      creatorName: video.creatorName,
      languageOriginal: video.languageOriginal,
      languageFromConfig: video.languageFromConfig,
      remoteClipUrl: video.url,
      status: TwitchVideoStatuses.IDLE,
      gameId,
    }))).then((videos) => videos.sort((a, b) => a.id - b.id));
  }
}
