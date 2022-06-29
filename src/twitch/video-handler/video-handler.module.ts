import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from 'src/http/http.module';
import { TwitchVideo } from '../video.entity';
import { DefaultTwitchVideoHandlerService } from './video-handler.service';
import { TwitchVideoHandlerService } from './video-handler.type';

const shared = [{
  provide: TwitchVideoHandlerService,
  useClass: DefaultTwitchVideoHandlerService,
}]

@Module({
  imports: [
    TypeOrmModule.forFeature([TwitchVideo]),
    BullModule.registerQueue({
      name: 'twitch-video-handler',
    }),
    HttpModule,
  ],
  exports: shared,
  providers: shared,
})
export class TwitchVideoHandlerModule { }
