import { Injectable } from '@nestjs/common';
import { number, object, Schema, string } from 'yup';
import { TwitchApiMap, TwitchVideoDto } from './twitch-api.map';

type ValidationOptions = {
  language: string;
  minViewsCount: number;
}

const isLanguageValid = (videoLanguage: string, languageFromConfig: string) => {
  if (languageFromConfig === "all") return true;

  if (languageFromConfig.includes("not_")) {
    const languageToAvoid = languageFromConfig.split('_')[1];
    return languageToAvoid !== videoLanguage;
  }

  return videoLanguage === languageFromConfig;
}

export const getValdiationSchema = ({language: languageFromConfig, minViewsCount }: ValidationOptions): Schema<TwitchVideoDto> => object({
  title: string().required(),
  creatorName: string().required(),
  url: string().required().url(),
  languageOriginal: string().required().test('isLanguageValid', (videoLanguage) => isLanguageValid(videoLanguage, languageFromConfig)),
  languageFromConfig: string().required(),
  duration: number().required().moreThan(5),
  viewCount: number().required().moreThan(minViewsCount),
})

@Injectable()
export class TwitchApiValidator {
  constructor(private twitchApiMap: TwitchApiMap) { }

  validateVideos(videos: Array<unknown>, validationOptions: ValidationOptions) {
    return videos.reduce<Array<TwitchVideoDto>>((result, video) => {
      const baseVideo = this.twitchApiMap.videoToDto(video, { languageFromConfig: validationOptions.language });
      const resultVideo = this.validateVideo(baseVideo, validationOptions);
      if (resultVideo) result.push(resultVideo);
      return result;
    }, [])
  }

  validateVideo(dto: unknown, validationOptions: ValidationOptions): TwitchVideoDto | null {
    try {
      const validDto = getValdiationSchema(validationOptions).validateSync(dto);
      return validDto;
    } catch (err) {
      return null;
    }
  }
}