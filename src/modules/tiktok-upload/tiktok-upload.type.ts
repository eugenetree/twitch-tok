export abstract class TiktokUploadService {
  abstract uploadVideosIfAvailable: () => Promise<void>;
}