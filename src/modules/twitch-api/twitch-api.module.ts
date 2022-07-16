import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TwitchApiService } from './twitch-api.type';
import { DefaultTwitchApiService } from './twitch-api.service';
import { HttpModule } from 'src/modules/http/http.module';
import { TwitchVideo } from '../../entities/video.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwitchApiMap } from './twitch-api.map';
import { TwitchApiValidator } from './twitch-api.validator';

const shared = [{
  provide: TwitchApiService,
  useClass: DefaultTwitchApiService,  
}]

@Module({
  imports: [
    TypeOrmModule.forFeature([TwitchVideo]),
    ConfigModule,
    HttpModule,
    ConfigModule,
  ],
  providers: [...shared, TwitchApiMap, TwitchApiValidator],
  exports: [...shared, TwitchApiMap, TwitchApiValidator],
})
export class TwitchApiModule { }
