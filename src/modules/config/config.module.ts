import { Module } from '@nestjs/common';
import { DefaultConfigService } from './config.service';
import { ConfigService as CustomConfigService} from './config.type';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

const shared = [
  {
    provide: CustomConfigService,
    useClass: DefaultConfigService,
  }
]

@Module({
  imports: [NestConfigModule],
  providers: shared,
  exports: shared,
})
export class ConfigModule { }
