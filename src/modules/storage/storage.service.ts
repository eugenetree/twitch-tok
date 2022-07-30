import { Injectable } from '@nestjs/common';
import path from 'path';
import fs from 'fs';
import { StorageService } from './storage.type';

const VIDEO_PATH = '/storage/videos/';

@Injectable()
export class DefaultStorageService implements StorageService {
  getFolderPathForVideo: StorageService['getFolderPathForVideo'] = (entityId) => {
    return `${VIDEO_PATH}/${entityId}.mp4`;
  }
}