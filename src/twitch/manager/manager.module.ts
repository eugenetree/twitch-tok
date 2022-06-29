import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwitchApiModule } from '../api/api.module';
import { TwitchCrawlerModule } from '../crawler/crawler.module';
import { TwitchVideoHandlerModule } from '../video-handler/video-handler.module';
import { TwitchVideo } from '../video.entity';
import { DefaultTwitchManagerService } from './manager.service';
import { TwitchManagerService } from './manager.type';

const shared = [
  {
    provide: TwitchManagerService,
    useClass: DefaultTwitchManagerService,
  }
]

@Module({
  imports: [
    TypeOrmModule.forFeature([TwitchVideo]),
    BullModule.registerQueue({
      name: 'twitch-video-handler',
    }),
    TwitchApiModule,
    TwitchCrawlerModule,
    TwitchVideoHandlerModule,
  ],
  exports: shared,
  providers: shared,
})
export class TwitchManagerModule { }
