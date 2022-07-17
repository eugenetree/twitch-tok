export abstract class TwitchVideoHandlerService {
  public abstract createVideo(): Promise<void>;
}