import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import {
  ConfigModule as NestConfigModule,
  ConfigService as NestConfigService
} from '@nestjs/config';
import { StorageModule } from './modules/storage/storage.module';
import { TwitchManagerModule } from './modules/twitch-manager/manager.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { TwitchVideoHandlerModule } from './modules/twitch-video-handler/video-handler.module';
import { TiktokUploadModule } from './modules/tiktok-upload/tiktok-upload.module';
import { dbConfig } from './db/config';

@Module({
  imports: [
    TypeOrmModule.forRoot(dbConfig),
    ScheduleModule.forRoot(),
    NestConfigModule.forRoot({
      envFilePath: '.env',
    }),
    BullModule.forRoot({
      redis: {
        host: 'redis',
        port: 6379,
      },
    }),
    TwitchVideoHandlerModule,
    TwitchManagerModule,
    StorageModule,
    TiktokUploadModule,
    NestConfigModule,
  ],
})
export class AppModule { }
