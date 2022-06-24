FROM node:16

WORKDIR /app

COPY package*.json ./

RUN yarn

COPY . .

RUN apt-get update -y
RUN apt-get install ffmpeg -y
RUN ffmpeg -version

RUN apt-get install -y wget
RUN wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN apt-get install ./google-chrome-stable_current_amd64.deb

RUN yarn global add @nestjs/cli 

CMD ["yarn", "run", "start:dev"]