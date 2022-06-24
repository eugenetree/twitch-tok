import { Module } from '@nestjs/common';
import { DefaultStorageService } from './storage.service';
import { StorageService } from './storage.type';

const shared = [
  {
    provide: StorageService,
    useClass: DefaultStorageService,
  }
]

@Module({
  providers: [...shared],
  exports: [...shared],
})
export class StorageModule { }
