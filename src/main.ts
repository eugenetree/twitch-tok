import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import fs from 'fs';

async function bootstrap() {
  const envText = fs.readFileSync('.env', 'utf8');
  if (!envText.includes('TIKTOK_COOKIES')) throw new Error('tiktok cookies error') // TODO update to better solution

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}

bootstrap();