import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { StorageModule } from './modules/storage/storage.module';
import { TwitchManagerModule } from './modules/twitch-manager/manager.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwitchVideo } from './entities/video.entity';
import { BullModule } from '@nestjs/bull';
import { TwitchVideoHandlerModule } from './modules/twitch-video-handler/video-handler.module';
import { TiktokUploadModule } from './modules/tiktok-upload/tiktok-upload.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'twitch-tok-db',
      port: 3306,
      username: 'twitch-tok',
      password: 'twitch-tok',
      database: 'twitch-tok',
      entities: [TwitchVideo],
      synchronize: true,
      extra: {
        charset: 'utf8mb4',
        collation: 'utf8mb4_unicode_ci',
      },
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
    ConfigModule,
  ],
})
export class AppModule { }
