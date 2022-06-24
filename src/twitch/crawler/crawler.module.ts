import { Module } from '@nestjs/common';
import { TwitchApiModule } from '../api/api.module';
import { TwitchCrawlerService } from './crawler.service';
import { TwitchVideoHandlerModule } from '../video-handler/video-handler.module';

@Module({
  imports: [TwitchApiModule, TwitchVideoHandlerModule],
  exports: [TwitchCrawlerService],
})
export class TwitchCrawlerModule { }
