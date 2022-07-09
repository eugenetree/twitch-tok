import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StorageModule } from 'src/modules/storage/storage.module';
import { TwitchApiService } from './api.type';
import { DefaultTwitchApiService } from './api.service';
import { HttpModule } from 'src/modules/http/http.module';
import { TwitchVideo } from '../../entities/video.entity';
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
