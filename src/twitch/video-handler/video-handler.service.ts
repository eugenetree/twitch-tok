import { InjectQueue, OnQueueActive, OnQueueError, Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import puppeeter from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';
import { TwitchVideoHandlerService } from './video-handler.type';
import fs from 'fs';
import path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { TwitchVideo } from '../video.entity';
import { Repository } from 'typeorm';
import { HttpService } from 'src/http/http.type';
import { exec } from 'child_process';

const Config = {
	followNewTab: true,
	fps: 60,
	videoFrame: {
		width: 1080,
		height: 2160,
	},
	aspectRatio: '10:20',
};

// ffmpeg -i underlay.mp4 -i overlay.mp4 -filter_complex "[1:v] scale=1500:-1 [test]; [0][test]overlay=0:0" -c:a copy outpu2.mp4

const TWITCH_VIDEO_HANDLER_QUEUE = 'twitch-video-handler';
const CREATE_VIDEO_PROCESS = 'create-video';

@Injectable()
@Processor('twitch-video-handler')
export class DefaultTwitchVideoHandlerService implements TwitchVideoHandlerService {
	constructor(
		@InjectQueue('twitch-video-handler')
		private twitchVideoHandlerQueue: Queue,
		@InjectRepository(TwitchVideo)
		private videosRepository: Repository<TwitchVideo>,
		private httpService: HttpService,
	) { }


	public async addVideosToQueue(videos: Array<string>): Promise<void> {
		await this.twitchVideoHandlerQueue.add(CREATE_VIDEO_PROCESS);
	}


	@Process(CREATE_VIDEO_PROCESS)
	private async createVideo(id) {
		const dirPath = path.resolve(`_storage/${1}`);
		fs.mkdirSync(dirPath, { recursive: true });
		this.getVideosForRender('https://www.twitch.tv/dreadztv/clip/HardLachrymoseTortoisePunchTrees-EEzrxEF920dDM5-h', dirPath);
	}

	private async getVideosForRender(clipUrl: string, dirForSave: string) {
		const browser = await puppeeter.launch({
			headless: true,
			defaultViewport: { width: 500, height: 1000 },
			executablePath: '/usr/bin/google-chrome',
			args: ['--no-sandbox'],
		})

		const page = await browser.newPage();
		const recorder = new PuppeteerScreenRecorder(page, Config); // Config is optional

		await page.goto(clipUrl);
		await page.waitForSelector('.tw-loading-spinner', { hidden: true });
		await page.evaluate(() => { document.querySelector('video').pause() })
		await page.click('button[data-a-target=player-theatre-mode-button]');

		await page.evaluate(() => {
			const el = document.querySelector('.video-chat__header');
			el.parentElement.removeChild(el);
		})

		await recorder.start(path.join(dirForSave, 'underlay.mp4'));
		await page.evaluate(() => { document.querySelector('video').play() })
		await page.evaluate(() => new Promise(resolve => {
			const video = document.querySelector('video');
			const interval = setInterval(() => {
				if (video.currentTime === video.duration) {
					resolve(true);
					clearInterval(interval);
				};
			}, 1000)
		}))
		await recorder.stop();

		const clipDownloadUrl = await page.evaluate(() => {
			return document.querySelector('video').src;
		})

		await browser.close();

		// const clipDownloadUrl = 'https://production.assets.clips.twitchcdn.net/39568803960-offset-1454.mp4?sig=38ddf6e3742d5baf5178362ed9eae766b74988c3&token=%7B%22authorization%22%3A%7B%22forbidden%22%3Afalse%2C%22reason%22%3A%22%22%7D%2C%22clip_uri%22%3A%22https%3A%2F%2Fproduction.assets.clips.twitchcdn.net%2F39568803960-offset-1454.mp4%22%2C%22device_id%22%3A%22MQmnTdLDQxO0yuAcj4HIx0EkfAJtRVRF%22%2C%22expires%22%3A1656502788%2C%22user_id%22%3A%22%22%2C%22version%22%3A2%7D'
		const { data } = await this.httpService.get(clipDownloadUrl, { responseType: 'stream' });

		data.pipe(fs.createWriteStream(path.join(dirForSave, 'overlay.mp4')));
		data.on('end', () => {
			console.log('end');
			exec(`ffmpeg -i _storage/1/underlay.mp4 -i _storage/1/overlay.mp4 -filter_complex "[1:v] scale=1080:-1 [test]; [0][test]overlay=0:0" -c:a copy  output23313.mp4`, (error, stdout, stderr) => {
				if (error) {
					console.error(`exec error: ${error}`);
					return;
				}
				console.log(`stdout: ${stdout}`);
				console.error(`stderr: ${stderr}`);
			})
		})

		data.on('error', () => {
			console.log('error');
		})

		// exec(`ffmpeg -i underlay.mp4 -i overlay.mp4 -filter_complex "[1:v] scale=1500:-1 [test]; [0][test]overlay=0:0" -c:a copy outpu2.mp4`)
		
	}
}


// async function downloadImage() {

// 	const url = 'https://production.assets.clips.twitchcdn.net/39568803960-offset-1454.mp4?sig=38ddf6e3742d5baf5178362ed9eae766b74988c3&token=%7B%22authorization%22%3A%7B%22forbidden%22%3Afalse%2C%22reason%22%3A%22%22%7D%2C%22clip_uri%22%3A%22https%3A%2F%2Fproduction.assets.clips.twitchcdn.net%2F39568803960-offset-1454.mp4%22%2C%22device_id%22%3A%22MQmnTdLDQxO0yuAcj4HIx0EkfAJtRVRF%22%2C%22expires%22%3A1656502788%2C%22user_id%22%3A%22%22%2C%22version%22%3A2%7D'
// 	const paths = path.resolve(__dirname, 'code1.mp4')

// 	// axios image download with response type "stream"
// 	const response = await axios({
// 		method: 'GET',
// 		url: url,
// 		responseType: 'stream'
// 	})

// 	// pipe the result stream into a file on disc
// 	response.data.pipe(fs.createWriteStream(paths))

// 	// return a promise and resolve when download finishes
// 	return new Promise((resolve, reject) => {
// 		response.data.on('end', () => {
// 			resolve()
// 		})

// 		response.data.on('error', () => {
// 			reject()
// 		})
// 	})

// } 