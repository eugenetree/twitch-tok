export abstract class StorageService {
  abstract getFolderPathForVideo(entityId: string): string;
}