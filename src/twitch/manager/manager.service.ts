import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { Repository } from 'typeorm';
import { TwitchApiService } from '../api/api.type';
import { TwitchVideoHandlerService } from '../video-handler/video-handler.type';
import { TwitchVideo } from '../video.entity';
import { TwitchManagerService } from './manager.type';

@Injectable()
export class DefaultTwitchManagerService implements TwitchManagerService {
  constructor(
    @InjectRepository(TwitchVideo)
    private videosRepository: Repository<TwitchVideo>,
    @InjectQueue('twitch-video-handler')
    private twitchVideoHandlerQueue: Queue,
    private readonly twitchApiService: TwitchApiService,
    private readonly twitchVideoHandlerService: TwitchVideoHandlerService,
  ) { }

  async onModuleInit() { 
    this.checkForNewClips();
  }

  // @Cron(CronExpression.EVERY_HOUR)
  public async checkForNewClips(): Promise<void> {
    const newVideos = await this.twitchApiService.getNewClips();
    // const dbVideos = await this.addVideosToDb(newVideos);
    // const dbVideosIds = dbVideos.map((video) => video.id);
    await this.twitchVideoHandlerService.addVideosToQueue(['']);
  }


  private addVideosToDb(videos) {
    return Promise.all(videos.map((video) => this.videosRepository.save(video)));
  }

  private addVideosToRenderQueue(videos) {

  }
}
