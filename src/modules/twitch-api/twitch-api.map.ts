import { Injectable } from "@nestjs/common";
import { ConfigService } from "../config/config.type";

export type TwitchVideoDto = {
  title: string;
  creatorName: string;
  url: string;
  languageOriginal: string;
  languageFromConfig: string;
  duration: number;
  viewCount: number;
}

@Injectable()
export class TwitchApiMap {
  constructor(private configService: ConfigService) { }

  videoToDto(videoFromApi: any, { languageFromConfig }: { languageFromConfig: string }): unknown {
    try {
      const { title, url, creatorName, language, duration, viewCount } = videoFromApi;
      return {
        title,
        creatorName,
        url: `https://www.twitch.tv/eugenedrvnk/clip/${url.split('/')[3]}`,
        languageOriginal: language,
        languageFromConfig,
        duration,
        viewCount
      }
    } catch (err) {
      return null;
    }
  }
}