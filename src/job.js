import Queue from 'rethinkdb-job-queue';
import { jobOptions } from './config/db';
const q = new Queue(jobOptions);

export function createJob(news) {

  const jobs = q.createJob(news.length);
  jobs.map((it, idx) => it.data = news[idx]);
  q.addJob(jobs).then(() => q.stop());
}

export default q;
