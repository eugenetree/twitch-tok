import { Module } from '@nestjs/common';
import { TwitchCrawlerModule } from '../crawler/crawler.module';
import { TwitchVideoHandlerModule } from '../video-handler/video-handler.module';
import { TwitchManagerService } from './manager.service';

@Module({
  imports: [TwitchCrawlerModule, TwitchVideoHandlerModule],
  exports: [TwitchManagerService],
})
export class TwitchManagerModule {}
