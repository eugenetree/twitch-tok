export abstract class TwitchManagerService {
  public abstract checkForNewClips(): Promise<void>;
}

// twitch manager every hour check if new videos appeared on clips 
// and if there is something new interesting 

// add video to job

// job should handle it

// tiktok downloader every hour will check if there any new videos to upload