import { Injectable, OnModuleInit } from '@nestjs/common';
import { TiktokUploadService } from './tiktok-upload.type';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import puppeteer from 'puppeteer-extra';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { TwitchVideo } from '../../entities/video.entity';
import { Repository } from 'typeorm';
import { TwitchVideoStatuses } from '../../entities/video.type';
import { TiktokUpload } from './tiktok-upload.entity';
import { ConfigService } from '../config/config.type';


puppeteer.use(stealthPlugin())

@Injectable()
export class DefaultTiktokUploadService implements TiktokUploadService, OnModuleInit {
  private isUploadInProgress: boolean = false;

  constructor(
    private configService: ConfigService,
    @InjectRepository(TwitchVideo) private videosRepository: Repository<TwitchVideo>,
    @InjectRepository(TiktokUpload) private tiktokUploadRepository: Repository<TiktokUpload>,
  ) { }


  async onModuleInit() {
    await this.prepareTikTokUploadEntitiesInDb();
  }


  public async uploadVideosIfAvailable() {
    if (this.configService.isBusy()) {
      console.log(new Date(),'upload is unavailable because busy');
      return
    };
    if (this.isUploadInProgress) return;

    const videos = [
      ...await this.videosRepository.find({ where: { status: TwitchVideoStatuses.UPLOAD_ERROR } }),
      ...await this.videosRepository.find({ where: { status: TwitchVideoStatuses.PREPARE_VIDEOS_SUCCESS } }),
    ];
    if (!videos.length) return;

    let videoToUpload: TwitchVideo | null = null;
    let tiktokUploadEntity: TiktokUpload | null = null;

    for (const video of videos) { // TODO: create better naming for tiktokUploadEntity
      const tiktokUploader = await this.tiktokUploadRepository.findOne({ where: { gameId: video.gameId, language: video.languageFromConfig } });
      if (!tiktokUploader) continue;

      console.log(new Date(),tiktokUploader.lastUploadDate, typeof tiktokUploader.lastUploadDate);

      if (tiktokUploader.lastUploadDate === null) {
        videoToUpload = video;
        tiktokUploadEntity = tiktokUploader;
        break;
      }

      const wasLastTiktokUploadMore30MinutesAgo = (Number(new Date()) - Number(tiktokUploader.lastUploadDate) > 1000 * 60 * 10);
      if (wasLastTiktokUploadMore30MinutesAgo) {
        videoToUpload = video;
        tiktokUploadEntity = tiktokUploader;
        break;
      }
    }

    if (!videoToUpload || !tiktokUploadEntity) throw new Error('no suitable tiktok account');

    this.configService.setIsBusy(true);

    console.log(new Date(),`TiktokUploadService | uploadVideosIfAvailable | init | ${videoToUpload.id}`)
    this.videosRepository.update(videoToUpload.id, { status: TwitchVideoStatuses.UPLOAD_PROGRESS });
    this.isUploadInProgress = true;

    try {
      await this.uploadVideo(videoToUpload);
      this.tiktokUploadRepository.update(tiktokUploadEntity.id, { lastUploadDate: new Date() })
      await this.videosRepository.update(videoToUpload.id, { status: TwitchVideoStatuses.UPLOAD_SUCCESS });
      console.log(new Date(),`TiktokUploadService | uploadVideosIfAvailable | success | ${videoToUpload.id}`)
    } catch (err) {
      console.log(new Date(),`TiktokUploadService | uploadVideosIfAvailable | error | `, err)
      this.tiktokUploadRepository.update(tiktokUploadEntity.id, { lastUploadDate: new Date(Number(new Date()) + 1000 * 60 * 60) })
      await this.videosRepository.update(videoToUpload.id, { status: TwitchVideoStatuses.UPLOAD_ERROR });
    } finally {
      this.isUploadInProgress = false;
      this.configService.setIsBusy(false);
    }
  }

  public async uploadVideo(video: TwitchVideo): Promise<void> {
    const cookies = this.configService.getTikTokCookies(video.gameId, video.languageFromConfig);

    if (!cookies) {
      throw new Error('cookies not found');
    }

    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: { width: 1920, height: 1080 },
      executablePath: '/usr/bin/google-chrome',
      args: ['--no-sandbox'],
    })

    try {
      const page = await browser.newPage();
      await page.setCookie(...cookies as any)
      await page.goto('https://www.tiktok.com/upload', { waitUntil: 'networkidle0', timeout: 0 });

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

    } finally {
      browser.close();
    }
  }


  private async prepareTikTokUploadEntitiesInDb() {
    const configs = this.configService.getTwitchGamesConfigsAsArray();
    for (const { gameId, language } of configs) {
      if (await this.tiktokUploadRepository.findOneBy({ gameId, language })) continue;
      await this.tiktokUploadRepository.save({ gameId, language });
    }
  }
}
