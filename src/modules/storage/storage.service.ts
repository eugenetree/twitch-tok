import { Injectable } from '@nestjs/common';
import path from 'path';
import fs from 'fs';
import { StorageService } from './storage.type';

@Injectable()
export class DefaultStorageService implements StorageService {
  private readonly storagePath: string = path.resolve('storage');
  private readonly videosPath: string = path.resolve(this.storagePath, 'videos');

  constructor() {
    fs.mkdirSync(this.storagePath, { recursive: true });
    fs.mkdirSync(this.videosPath, { recursive: true });
  }

  getFolderPathForVideo(entityId: number): string {
    const dirPath = path.resolve(this.videosPath, String(entityId));
    fs.mkdirSync(dirPath, { recursive: true });
    return dirPath;
  }
}