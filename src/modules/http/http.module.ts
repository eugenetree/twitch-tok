import { Module } from '@nestjs/common';
import { DefaultHttpService } from './http.service';
import { HttpService } from './http.type';

const shared = [
  {
    provide: HttpService,
    useClass: DefaultHttpService,
  }
]

@Module({
  providers: shared,
  exports: shared,
})
export class HttpModule {}
