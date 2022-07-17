import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import fs from 'fs'
import { TwitchApiService } from './modules/twitch-api/twitch-api.type';
import { DefaultTwitchApiService } from './modules/twitch-api/twitch-api.service';


// const Queue = require('bull');
// const { createBullBoard } = require('@bull-board/api');
// const { BullAdapter } = require('@bull-board/api/bullAdapter');
// const { ExpressAdapter } = require('@bull-board/express');


async function bootstrap() {
  const envText = fs.readFileSync('.env', 'utf8');
  if (!envText.includes('TIKTOK_COOKIES')) throw new Error('tiktok cookies error') // TODO update to better solution

  // const someQueue = new Queue('twitch-video-handler', {
  //   redis: { port: 6379, host: 'redis' },
  // }); // if you have a special connection to redis.

  // const serverAdapter = new ExpressAdapter();

  // const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  //   queues: [new BullAdapter(someQueue)],
  //   serverAdapter: serverAdapter,
  // });

  // serverAdapter.setBasePath('/admin/queues');


  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // app.use('/admin/queues', serverAdapter.getRouter());

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();