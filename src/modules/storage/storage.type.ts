export abstract class StorageService {
  abstract getFolderPathForVideo(entityId: number): string;
}