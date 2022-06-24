export abstract class StorageService {
  abstract setItem(key: string, value: unknown);
  abstract getItem(key: string);
  abstract removeItem(key: string);
}