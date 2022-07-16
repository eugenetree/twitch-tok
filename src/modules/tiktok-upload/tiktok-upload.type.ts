import { TwitchVideo } from "src/entities/video.entity";

export abstract class TiktokUploadService {
  abstract uploadVideosIfAvailable: () => Promise<void>;
}