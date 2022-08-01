import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from 'src/modules/http/http.module';
import { VideoEntity } from '../video/video.entity';
import { ConfigModule } from '../config/config.module';
import { StorageModule } from '../storage/storage.module';
import { DefaultTwitchVideoHandlerService } from './video-handler.service';
import { TwitchVideoHandlerService } from './video-handler.type';

const shared = [{
  provide: TwitchVideoHandlerService,
  useClass: DefaultTwitchVideoHandlerService,
}]

@Module({
  imports: [
    TypeOrmModule.forFeature([VideoEntity]),
    BullModule.registerQueue({
      name: 'twitch-video-handler',
    }),
    HttpModule,
    StorageModule,
    ConfigModule,
  ],
  exports: shared,
  providers: shared,
})
export class TwitchVideoHandlerModule { }
