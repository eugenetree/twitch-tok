import { mixed, object, SchemaOf, string } from 'yup';
import { TwitchVideoStatuses } from './video.type';

export type TwitchVideoDto = {
  title: string;
  creatorName: string;
  remoteClipUrl: string;
  localVideoPath: string;
  status: TwitchVideoStatuses;
}

export const twitchVideoSchema: SchemaOf<TwitchVideoDto> = object({
  title: string().required(),
  creatorName: string().required(),
  remoteClipUrl: string().url(),
  localVideoPath: string().nullable(),
  status: mixed().oneOf([TwitchVideoStatuses]),
})