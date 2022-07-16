import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from 'src/modules/http/http.module';
import { ConfigModule } from '../config/config.module';
import { TwitchApiModule } from '../twitch-api/twitch-api.module';
import { TwitchVideoHandlerModule } from '../twitch-video-handler/video-handler.module';
import { TwitchVideo } from '../../entities/video.entity';
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
    TwitchApiModule,
    TwitchVideoHandlerModule,
    HttpModule,
    ConfigModule,
  ],
  exports: shared,
  providers: shared,
})
export class TwitchManagerModule { }
