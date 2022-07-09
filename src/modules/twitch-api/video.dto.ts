import { Injectable } from '@nestjs/common';
import { mixed, number, object, SchemaOf, string, } from 'yup';
import { TwitchVideoLanguages } from '../../entities/video.type';

export type TwitchVideoDto = {
  title: string;
  creatorName: string;
  url: string;
  language: TwitchVideoLanguages;
  duration: number;
  viewCount: number;
}

export const twitchVideoSchema: SchemaOf<TwitchVideoDto> = object({
  title: string().required(),
  creatorName: string().required(),
  url: string().required().url(),
  language: mixed().oneOf(Object.values(TwitchVideoLanguages)),
  duration: number().required().moreThan(10),
  viewCount: number().required().moreThan(500),
})

const transformVideoDto = (videoDto: any): unknown => {
  const { title, url, creatorName, language, duration, viewCount } = videoDto;
  return { title, creatorName, url, language, duration, viewCount }
}

export const prepareTwitchVideo = (videoDto: unknown): TwitchVideoDto | null => {
  try {
    const transformedVideoDto = transformVideoDto(videoDto)
    const validVideo = twitchVideoSchema.validateSync(transformedVideoDto);
    validVideo.url = `https://www.twitch.tv/eugenedrvnk/clip/${validVideo.url.split('/')[3]}`;
    return twitchVideoSchema.cast(validVideo) as TwitchVideoDto;
  } catch (err) {
    return null;
  }
}

export const prepareTwitchVideos = (videos: Array<unknown>): Array<TwitchVideoDto> => {
  return videos.reduce<Array<TwitchVideoDto>>((result, video) => {
    const preparedVideo = prepareTwitchVideo(video);
    if (preparedVideo !== null) result.push(preparedVideo);
    return result;
  }, [])
}