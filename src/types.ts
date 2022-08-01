type Languages = "ru" | "en"

type UploaderConfig = {
  gameId: string;
  language: "all" | { exclude?: Languages, include?: Languages };
  strategies: Array<{
    checkTime: string;
    uploadTime: string;
    renderType: "allClipsOneVideo" | "oneClipOneVideo"; 
    requirements: {
      rating?: number,
      minViews?: number,
    }
  }>
}

type TiktokUploaderConfig = UploaderConfig & {
  type: "tiktok",
  cookies: unknown;
}

type YoutubeUploaderConfig = UploaderConfig & {
  type: "youtube",
  clientId: string; 
  clientSecret: string;
  tags: Array<string>,
}

export type AppConfig = {
  twitchClientId: string;
  twitchClientSecret: string;
  uploaders: Array<TiktokUploaderConfig | YoutubeUploaderConfig>;
}