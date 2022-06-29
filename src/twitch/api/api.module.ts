import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StorageModule } from 'src/storage/storage.module';
import { TwitchApiService } from './api.type';
import { DefaultTwitchApiService } from './api.service';
import { HttpModule } from 'src/http/http.module';
import { TwitchVideo } from '../video.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

const shared = [{
  provide: TwitchApiService,
  useClass: DefaultTwitchApiService,  
}]

@Module({
  imports: [
    TypeOrmModule.forFeature([TwitchVideo]),
    ConfigModule,
    HttpModule,
  ],
  providers: shared,
  exports: shared,
})
export class TwitchApiModule { }
