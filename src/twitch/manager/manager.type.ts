type FilePath = string;

abstract class TwitchManager {
  abstract downloadNewVideos(): Promise<Array<FilePath>>; 
  abstract createVideos(): Promise<Array<File>>;
}