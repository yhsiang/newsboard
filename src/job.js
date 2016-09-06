import Queue from 'rethinkdb-job-queue';
import { jobOptions } from './config/db';
const q = new Queue(jobOptions);

export async function createJob(news) {

  const jobs = q.createJob(news.length);
  jobs.map((it, idx) => it.data = news[idx]);
  const savedJobs = await q.addJob(jobs);

  q.stop();
}

export default q;
