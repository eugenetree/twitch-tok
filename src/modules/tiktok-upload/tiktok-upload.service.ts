import { Injectable } from '@nestjs/common';
import { TiktokUploadService } from './tiktok-upload.type';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';
import puppeteer from 'puppeteer-extra';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { TwitchVideo } from '../../entities/video.entity';
import { Repository } from 'typeorm';
import { TwitchVideoStatuses } from '../../entities/video.type';
import { ConfigService } from '../config/config.type';

puppeteer.use(stealthPlugin())

@Injectable()
export class DefaultTiktokUploadService implements TiktokUploadService {
  private isUploadInProgress: boolean = false;

  constructor(
    private configService: ConfigService,
    @InjectRepository(TwitchVideo) private videosRepository: Repository<TwitchVideo>,
  ) { }

  @Cron(CronExpression.EVERY_5_MINUTES)
  public async uploadVideosIfAvailable() {
    if (this.isUploadInProgress) return;
    
    const video = await this.videosRepository.findOne({ where: { status: TwitchVideoStatuses.PREPARE_VIDEOS_SUCCESS } });
    if (!video) return;

    console.log(`TiktokUploadService > uploadVideosIfAvailable > start upload of video ${video.id}`);
    this.videosRepository.update(video.id, { status: TwitchVideoStatuses.UPLOAD_PROGRESS });
    this.isUploadInProgress = true;

    try {
      await this.uploadVideo(video);
      this.videosRepository.update(video.id, { status: TwitchVideoStatuses.UPLOAD_ERROR });
    } catch (err) {
      this.videosRepository.update(video.id, { status: TwitchVideoStatuses.UPLOAD_SUCCESS });
    } finally {
      this.isUploadInProgress = false;
    }
  }

  public async uploadVideo(video: TwitchVideo): Promise<void> {
    try {
      const cookies = this.configService.getTikTokCookies(video.gameId);
      if (!cookies) {
        console.log(`TiktokUploadService > uploadVideosIfAvailable > error > cookies not found`);
      }

      const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: { width: 1920, height: 1080 },
        executablePath: '/usr/bin/google-chrome',
        args: ['--no-sandbox'],
      })

      const page = await browser.newPage();
      await page.setCookie(cookies as any)
      await page.goto('https://www.tiktok.com/upload', { waitUntil: 'networkidle0', });

      const frameHandle = await page.$('iframe');

      const frame = await frameHandle?.contentFrame();

      const fileInput = await frame?.$('input[type=file]')
      fileInput?.uploadFile(video.localVideoPath)

      await frame?.waitForSelector('.btn-post button:not(disabled)');

      await frame?.evaluate(() => new Promise((resolve) => {
        const interval = setInterval(() => {
          if ((document.querySelector('.btn-post button') as HTMLButtonElement)?.disabled === false) {
            resolve(true);
            clearInterval(interval);
          }
        })
      }))

      const titleInput = await frame?.$('.public-DraftEditor-content');
      await titleInput?.click({ clickCount: 3 })
      await titleInput?.type(video.title);

      await frame?.click('.btn-post button')

      await frame?.waitForSelector('.upload-progress');
      await frame?.waitForSelector('.upload-progress', { hidden: true });
    } catch (err) {
      console.log('err');
      console.log(err);
    }
  }
}
