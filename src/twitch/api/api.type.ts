
export abstract class TwitchApiService {
  public abstract getNewClips(): Promise<Array<any>>;
}