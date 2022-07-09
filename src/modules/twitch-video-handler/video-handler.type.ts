export abstract class TwitchVideoHandlerService {
  public abstract addVideosToQueue(videosIds: Array<number>): Promise<void>;
}