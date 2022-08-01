import { Module } from '@nestjs/common';
import { TwitchApiService } from './twitch-api.type';
import { DefaultTwitchApiService } from './twitch-api.service';
import { HttpModule } from 'src/modules/http/http.module';
import { VideoEntity } from '../video/video.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwitchApiMap } from './twitch-api.map';
import { TwitchApiValidator } from './twitch-api.validator';
import { ConfigModule as CustomConfigModule } from '../config/config.module';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

const shared = [{
  provide: TwitchApiService,
  useClass: DefaultTwitchApiService,
}]

@Module({
  imports: [
    TypeOrmModule.forFeature([VideoEntity]),
    HttpModule,
    CustomConfigModule,
    NestConfigModule,
  ],
  providers: [...shared, TwitchApiMap, TwitchApiValidator],
  exports: [...shared, TwitchApiMap, TwitchApiValidator],
})
export class TwitchApiModule { }
