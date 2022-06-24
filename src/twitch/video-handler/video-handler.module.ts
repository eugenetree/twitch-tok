import { Module } from '@nestjs/common';
import { TwitchVideoHandlerService } from './video-handler.service';

@Module({
  exports: [TwitchVideoHandlerService],
})
export class TwitchVideoHandlerModule { }
