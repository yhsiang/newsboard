import fb, { API } from "../helper/facebook";
import r from "rethinkdb";
import Queue from 'rethinkdb-job-queue';
import { dbOptions, jobOptions } from '../config/db';

const LIMIT = 10;
const authOptions ={
  client_id: process.env.AppId,
  client_secret: process.env.AppSecret,
  grant_type: 'client_credentials',
};
const q = new Queue(jobOptions);

/*
{
  og_object {
    id
    description
    title
    type
    updated_time
  }
  share {
    comment_count
    share_count
  }
  id
}
*/

q.on('completed', jobId => console.log(`Job completed: ${jobId}`));

async function processJob() {
  const conn = await r.connect(dbOptions);
  const token = await API('oauth/access_token', authOptions);
  fb.setAccessToken(token);
  console.log('Auth done!');

  q.process(async (job, next) => {
    try {
      const graph = await API(job.data.link);
      const result = await r.table('graphs').insert(graph).run(conn);
      setTimeout(() => next() , 2000);
    } catch (e) {
      console.log(e);
    }
  });
}

processJob();
