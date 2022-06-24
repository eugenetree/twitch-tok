import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { decamelize } from 'humps';
import { StorageModule } from 'src/storage/storage.module';
import { TwitchApiService } from './api.type';
import { DefaultTwitchApiService } from './api.service';
import { HttpModule } from 'src/http/http.module';

@Module({
  imports: [
    ConfigModule,
    StorageModule,
    HttpModule,
  ],
  providers: [
    {
      provide: TwitchApiService,
      useClass: DefaultTwitchApiService,
    },
  ],
  exports: [
    {
      provide: TwitchApiService,
      useClass: DefaultTwitchApiService,
    },
  ]
})
export class TwitchApiModule { }
