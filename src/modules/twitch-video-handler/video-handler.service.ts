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
import { execSync } from 'child_process';
import { TwitchVideoStatuses } from '../../entities/video.type';
import { StorageService } from '../storage/storage.type';

const videoRecordConfig = {
	followNewTab: true,
	fps: 60,
	aspectRatio: '1:2',
	videoFrame: {
		width: 1080,
		height: 2160,
	},
};

const TWITCH_VIDEO_HANDLER_QUEUE = 'twitch-video-handler';
const CREATE_VIDEO_PROCESS = 'create-video';

@Injectable()
@Processor(TWITCH_VIDEO_HANDLER_QUEUE)
export class DefaultTwitchVideoHandlerService implements TwitchVideoHandlerService, OnModuleInit {
	constructor(
		@InjectQueue(TWITCH_VIDEO_HANDLER_QUEUE) private twitchVideoHandlerQueue: Queue,
		@InjectRepository(TwitchVideo) private videosRepository: Repository<TwitchVideo>,
		private httpService: HttpService,
		private storageService: StorageService,
	) { }


	async onModuleInit() {
		this.runProcessingForIdleVideos();	
	}


	public async addVideosToQueue(ids: Array<number>): Promise<void> {
		ids.forEach((id) => this.twitchVideoHandlerQueue.add(CREATE_VIDEO_PROCESS, id));
	}


	private async runProcessingForIdleVideos() {
		const videosToProcess = await this.videosRepository.find({where: {status: TwitchVideoStatuses.IDLE}})
		this.addVideosToQueue(videosToProcess.map((video) => video.id));
	}

	@Process(CREATE_VIDEO_PROCESS)
	private async createVideo({ data: id }: Job<number>) {
		console.log(`TwitchVideoHandlerSerivce > createVideo > for video ${id}`)

		const videoEntity = await this.videosRepository.findOneBy({ id });
		if (videoEntity === null) throw new Error("TwitchVideoHandlerSerivce > createVideo > videoEntity wasn't created before processing video");

		try {
			const dirPath = this.storageService.getFolderPathForVideo(id);

			await this.videosRepository.update(id, { status: TwitchVideoStatuses.PREPARE_VIDEOS_PROGRESS });
			await this.getVideosForRender({ videoEntity, dirPath });
			await this.mergeVideosToOne({ videoEntity, dirPath: dirPath });
			await this.videosRepository.update(id, { status: TwitchVideoStatuses.PREPARE_VIDEOS_SUCCESS });
		} catch (err) {
			console.log(err);
			await this.videosRepository.update(id, { status: TwitchVideoStatuses.PREPARE_VIDEOS_ERROR });
		}
	}

	private async getVideosForRender({ videoEntity, dirPath }: { videoEntity: TwitchVideo; dirPath: string }): Promise<void> {
		const { id, remoteClipUrl } = videoEntity;

		try {
			const browser = await puppeeter.launch({
				headless: true,
				defaultViewport: { width: 500, height: 1000 },
				executablePath: '/usr/bin/google-chrome',
				args: ['--no-sandbox'],
			})

			const page = await browser.newPage();
			const recorder = new PuppeteerScreenRecorder(page, videoRecordConfig);

			await page.goto(remoteClipUrl);
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

			console.log(clipDownloadUrl);

			if (!clipDownloadUrl) throw new Error('clipDownloadUrl wasn\'t parsed');

			await browser.close();

			const { data } = await this.httpService.get(clipDownloadUrl, { responseType: 'stream' });
			data.pipe(fs.createWriteStream(path.join(dirPath, 'overlay.mp4')));
			console.log(7);

			await new Promise((resolve, reject) => {
				data.on('end', () => {
					resolve('');

				});
				data.on('error', () => {
					reject()

				});
			})
			await this.videosRepository.update(id, { status: TwitchVideoStatuses.PREPARE_VIDEOS_SUCCESS, localVideoPath: path.resolve(dirPath, 'output.mp4') });
		} catch (err) {
			await this.videosRepository.update(id, { status: TwitchVideoStatuses.PREPARE_VIDEOS_ERROR });
			throw new Error("error during method 'getVideosForRender'")
		}
	}

	async mergeVideosToOne({ videoEntity, dirPath }: { videoEntity: TwitchVideo; dirPath: string; }) {
		execSync(`ffmpeg -i ${path.join(dirPath, 'underlay.mp4')} -i ${path.join(dirPath, 'overlay.mp4')} -filter_complex "[1:v] scale=1080:-1 [test]; [0][test]overlay=0:0" -c:a copy  ${path.join(dirPath, 'output.mp4')}`);
	}
}