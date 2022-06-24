import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import puppeeter from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';
// import { TwitchVideoHandlerService } from './video-handler.service.type';

const TWITCH_VIDEOS_LINK = 'https://www.twitch.tv/sashagrey/clip/PowerfulEnchantingMouseTF2John-4bhr_hApbNCPiNe8';

const Config = {
	followNewTab: true,
	fps: 60,
	// ffmpeg_Path: '<path >' || null,
	videoFrame: {
		width: 1500,
		height: 1875,
	},
	aspectRatio: '5:4',
};

// ffmpeg -i underlay.mp4 -i overlay.mp4 -filter_complex "[1:v] scale=1500:-1 [test]; [0][test]overlay=0:0" -c:a copy outpu2.mp4

@Injectable()
export class TwitchVideoHandlerService {
	// @Cron(CronExpression.EVERY_10_MINUTES)
	async checkNewVideos() {
		

		return;
		const browser = await puppeeter.launch({
			headless: false,
			defaultViewport: { width: 500, height: 625 },
			executablePath: '/usr/bin/google-chrome'
		})
		const page = await browser.newPage();
		const recorder = new PuppeteerScreenRecorder(page, Config); // Config is optional
		const savePath = './test/demo.mp4';

		page.on('console', async (msg) => {
			const msgArgs = msg.args();
			for (let i = 0; i < msgArgs.length; ++i) {
				console.log(await msgArgs[i].jsonValue());
			}
		});

		await page.goto('https://www.twitch.tv/dreadztv/clip/HardLachrymoseTortoisePunchTrees-EEzrxEF920dDM5-h');
		await page.waitForSelector('.tw-loading-spinner', { hidden: true });
		await page.evaluate(() => { document.querySelector('video').pause() })
		// await page.click('button[data-a-target=player-play-pause-button]')
		await page.click('button[data-a-target=player-theatre-mode-button]');
		await page.click('button[data-a-target=player-settings-button]');
		await page.click('button[data-a-target=player-settings-menu-item-quality]');
		// await page.evaluate(() => {
		//   const el = document.querySelector('.video-chat__header');
		//   el.parentElement.removeChild(el);
		// })
		// await recorder.start(savePath);
		// await page.evaluate(() => new Promise(resolve => {
		//   const video = document.querySelector('video');
		//   setInterval(() => {
		//     if (video.currentTime === video.duration) resolve(true);
		//   }, 1000)
		// }))
		// 	await recorder.stop();
		// await browser.close();

	}
}
