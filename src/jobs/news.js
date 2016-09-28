import Queue from 'rethinkdb-job-queue';
import { jobOptions } from '../config/db';
const q = new Queue(Object.assign({ name: 'News'}, jobOptions));

export function createJob(news) {
  q.reset()
   .then(total => {
     const jobs = q.createJob(news.length);
     jobs.map((it, idx) => it.data = news[idx]);
     return q.addJob(jobs)
   })
   .then(() => q.stop());
}

export default q;
