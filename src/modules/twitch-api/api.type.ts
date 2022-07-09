import { TwitchVideoDto } from "./video.dto";

export enum TWITCH_LINKS {
  LOGIN = 'https://id.twitch.tv/oauth2/token',
  GET_LAST_CLIPS = 'https://api.twitch.tv/helix/clips',
}

export abstract class TwitchApiService {
  public abstract getNewClips({ gameId }: { gameId: string }): Promise<Array<TwitchVideoDto>>;
}
