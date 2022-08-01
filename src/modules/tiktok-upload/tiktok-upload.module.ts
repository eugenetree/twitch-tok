import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoEntity } from '../video/video.entity';
import { ConfigModule } from '../config/config.module';
import { TiktokUpload } from './tiktok-upload.entity';
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
    TypeOrmModule.forFeature([VideoEntity, TiktokUpload]),
    ConfigModule,
  ],
  providers: shared,
  exports: shared,
})
export class TiktokUploadModule { }
