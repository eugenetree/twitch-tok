import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { TwitchApiModule } from './twitch/api/api.module';
import { StorageModule } from './storage/storage.module';
import { TwitchManagerModule } from './twitch/manager/manager.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwitchVideo } from './twitch/video.entity';
import { BullModule } from '@nestjs/bull';
import { TwitchVideoHandlerModule } from './twitch/video-handler/video-handler.module';

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
  ],
})
export class AppModule { }
