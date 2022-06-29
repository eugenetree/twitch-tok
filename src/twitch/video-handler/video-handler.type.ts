export abstract class TwitchVideoHandlerService {
  public abstract addVideosToQueue(videos: Array<string>): Promise<void>;
}