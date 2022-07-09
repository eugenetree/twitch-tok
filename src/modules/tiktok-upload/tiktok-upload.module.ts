import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwitchVideo } from '../../entities/video.entity';
import { ConfigModule } from '../config/config.module';
import { DefaultTiktokUploadService } from './tiktok-upload.service';
import { TiktokUploadService } from './tiktok-upload.type';

const shared = [
  {
    provide: TiktokUploadService,
    useClass: DefaultTiktokUploadService,
  }
]

@Module({
  imports: [
    TypeOrmModule.forFeature([TwitchVideo]),
    ConfigModule,
  ],
  providers: shared,
  exports: shared,
})
export class TiktokUploadModule { }
