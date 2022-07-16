import { TwitchGameConfig } from "../config/config.type";
import { TwitchVideoDto } from "./twitch-api.map";

export enum TWITCH_LINKS {
  LOGIN = 'https://id.twitch.tv/oauth2/token',
  GET_LAST_CLIPS = 'https://api.twitch.tv/helix/clips',
}

export abstract class TwitchApiService {
  public abstract getNewClips(gameConfig: TwitchGameConfig): Promise<Array<TwitchVideoDto>>;
}