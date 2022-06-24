type PathToVideo = string;

export abstract class TwitchVideoHandlerService {
  abstract downloadVideo(url: string): Promise<PathToVideo>;
  abstract 
}