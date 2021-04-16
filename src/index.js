import os from 'os';
import cluster from 'cluster';
import './config.js';

if (cluster.isMaster) {
  console.log(`Мастер запущен, PID: ${process.pid}`);

  const workersCount = process.env.WORKERS_COUNT || os.cpus().length - 1;
  for (let index = 0; index < workersCount; index++) {
    const worker = cluster.fork();

    worker.on('exit', () => {
      console.log(`Сервер был выключен, PID: ${worker.process.pid}`);
      cluster.fork();
    });
  }
}

if (cluster.isWorker) {
  await import('./worker.js');
}
