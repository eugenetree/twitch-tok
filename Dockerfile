FROM node:16

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN apt-get update -y
RUN apt-get install ffmpeg -y
RUN ffmpeg -version

CMD ["npm", "run", "start:dev"]