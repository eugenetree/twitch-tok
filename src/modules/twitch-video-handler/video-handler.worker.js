import {parentPort} from 'worker_threads';
import {exec} from "child_process";
import path from "path";

parentPort.on("message", async (dirPath) => {
  console.log('worker');
  const command = exec(`ffmpeg -i ${path.join(dirPath, 'underlay.mp4')} -i ${path.join(dirPath, 'overlay.mp4')} -filter_complex "[1:v] scale=1080:-1 [test]; [0][test]overlay=0:0" -c:a copy  ${path.join(dirPath, 'output.mp4 -y')}`);
		await new Promise((resolve) => command.on('close', resolve));
    parentPort.postMessage('postedMessage');
});