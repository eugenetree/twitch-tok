import { Injectable } from '@nestjs/common';
import { StorageService } from './storage.type';

@Injectable()
export class DefaultStorageService implements StorageService {
  private readonly storage: Map<string, unknown> = new Map();
  
  getItem(key: string) {
    return this.storage.get(key);
  }

  setItem(key: string, value: unknown) {
    return this.storage.set(key, value);
  }

  removeItem(key: string) {
    return this.storage.delete(key);
  }
}
