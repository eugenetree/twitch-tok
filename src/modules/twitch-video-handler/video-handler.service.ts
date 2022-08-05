import { InjectQueue, OnQueueActive, OnQueueError, Process, Processor } from '@nestjs/bull';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Job, Queue } from 'bull';
import puppeeter from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';
import { TwitchVideoHandlerService } from './video-handler.type';
import fs from 'fs';
import path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { TwitchVideo } from '../../entities/video.entity';
import { Repository } from 'typeorm';
import { HttpService } from 'src/modules/http/http.type';
import { exec, execSync } from 'child_process';
import { TwitchVideoStatuses } from '../../entities/video.type';
import { StorageService } from '../storage/storage.type';
import { Worker } from 'worker_threads';
import { ConfigService } from '../config/config.type';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';

const videoRecordConfig = {
	followNewTab: true,
	fps: 60,
	aspectRatio: '1:2',
	videoFrame: {
		width: 1080,
		height: 2160,
	},
};


@Injectable()
export class DefaultTwitchVideoHandlerService implements TwitchVideoHandlerService {
	constructor(
		@InjectRepository(TwitchVideo) private videosRepository: Repository<TwitchVideo>,
		private httpService: HttpService,
		private storageService: StorageService,
		private configService: ConfigService,
	) { }


	async createVideo() {
		if (this.configService.isBusy()) {
			console.log(new Date(),'video handling unavailable because is busy	');
			return
		};
		const videoEntity =
			await this.videosRepository.findOne({ where: { status: TwitchVideoStatuses.IDLE } });
		if (videoEntity === null) throw new Error("TwitchVideoHandlerSerivce > no video to process");

		this.configService.setIsBusy(true);
		const id = videoEntity.id;

		try {
			console.log(new Date(),`TwitchVideoHandlerSerivce | createVideo | init | ${id}`)
			const dirPath = this.storageService.getFolderPathForVideo(id);
			await this.videosRepository.update(id, { status: TwitchVideoStatuses.PREPARE_VIDEOS_PROGRESS });
			await new Promise(resolve => setTimeout(resolve, 10000));
			await this.getVideosForRender({ videoEntity, dirPath });
			await this.mergeVideosToOne({ videoEntity, dirPath: dirPath });
			await this.videosRepository.update(id, { status: TwitchVideoStatuses.PREPARE_VIDEOS_SUCCESS });
			console.log(new Date(),`TwitchVideoHandlerSerivce | createVideo | success | ${id}`)
		} catch (err) {
			console.log(new Date(),`TwitchVideoHandlerSerivce | createVideo | error | ${err}`)
			await this.videosRepository.update(id, { status: TwitchVideoStatuses.PREPARE_VIDEOS_ERROR });
		} finally {
			this.configService.setIsBusy(false);
		}
	}

	private async getVideosForRender({ videoEntity, dirPath }: { videoEntity: TwitchVideo; dirPath: string }): Promise<void> {

		const { id, remoteClipUrl } = videoEntity;

		const browser = await puppeeter.launch({
			headless: true,
			defaultViewport: { width: 500, height: 1000 },
			executablePath: '/usr/bin/google-chrome',
			args: ['--no-sandbox'],
		})

		try {
			const page = await browser.newPage();
			const recorder = new PuppeteerScreenRecorder(page, videoRecordConfig);

			console.log(new Date(),remoteClipUrl);
			await page.goto(remoteClipUrl, { timeout: 0 });
			await page.waitForSelector('.tw-loading-spinner', { hidden: true });
			await page.evaluate(() => { document.querySelector('video')?.pause() })
			await page.click('button[data-a-target=player-theatre-mode-button]');

			await page.evaluate(() => {
				const el = document.querySelector('.video-chat__header');
				el?.parentElement?.removeChild(el);
			})

			await recorder.start(path.join(dirPath, 'underlay.mp4'));
			await page.evaluate(() => { document.querySelector('video')?.play() })
			await page.evaluate(() => new Promise(resolve => {
				const video = document.querySelector('video');
				if (!video || isNaN(video.duration)) {
					throw new Error('Clip is possibly blocked');
				}
				const interval = setInterval(() => {
					if (video?.currentTime === video?.duration) {
						resolve(true);
						clearInterval(interval);
					};
				}, 1000)
			}))
			await recorder.stop();

			const clipDownloadUrl = await page.evaluate(() => {
				return document.querySelector('video')?.src;
			})

			if (!clipDownloadUrl) throw new Error('clipDownloadUrl wasn\'t parsed');

			await browser.close();

			const { data } = await this.httpService.get(clipDownloadUrl, { responseType: 'stream' });
			data.pipe(fs.createWriteStream(path.join(dirPath, 'overlay.mp4')));

			await new Promise((resolve, reject) => {
				data.on('end', () => {
					resolve('');

				});
				data.on('error', () => {
					reject()
				});
			})
		} finally {
			await browser.close();
		}
	}


	async mergeVideosToOne({ videoEntity, dirPath }: { videoEntity: TwitchVideo; dirPath: string; }): Promise<void> {
		return new Promise(resolve => {
			const worker = new Worker(path.join(__dirname, 'video-handler-worker.js'));
			worker.postMessage(dirPath)
			worker.on('message', async (result) => {
				await this.videosRepository.update(videoEntity.id, { localVideoPath: path.resolve(dirPath, 'output.mp4') });
				console.log(new Date(),result);
				resolve(result);
			})

		})

	}
}