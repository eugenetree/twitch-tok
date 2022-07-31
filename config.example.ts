import { CronExpression } from "@nestjs/schedule"
import { AppConfig } from "src/types"

const appConfig: AppConfig = {
  twitchClientId: '123',
  twitchClientSecret: '123',
  uploaders: [
    {
      cookies: [],
      type: 'tiktok',
      gameId: '123',
      language: "all",
      strategies: [
        {
          checkTime: CronExpression.EVERY_10_HOURS,
          uploadTime: CronExpression.EVERY_12_HOURS,
          renderType: 'oneClipOneVideo',
          requirements: {
            rating: 20,
            minViews: 300,
          }
        }
      ]
    }
  ]
}
