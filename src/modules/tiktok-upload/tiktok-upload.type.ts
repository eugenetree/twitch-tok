import { TwitchVideo } from "src/entities/video.entity";

export abstract class TiktokUploadService {
  abstract uploadVideo(videoEntity: TwitchVideo): Promise<void>;
}