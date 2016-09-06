import fb, { API } from "../helper/facebook";
import r from "rethinkdb";
import Queue from "rethinkdb-job-queue";
import { dbOptions, jobOptions } from "../config/db";

const tableName = "Graph";
const LIMIT = 10;
const authOptions ={
  client_id: process.env.AppId,
  client_secret: process.env.AppSecret,
  grant_type: 'client_credentials',
};
const q = new Queue(jobOptions);

q.on('completed', jobId => console.log(`${new Date()} Job completed: ${jobId}`));
q.on('failed', jobId => console.log(`${new Date()} Job Failed: ${jobId}`));

async function processJob() {
  const conn = await r.connect(dbOptions);
  const token = await API('oauth/access_token', authOptions);
  fb.setAccessToken(token);
  console.log('Auth done!');

  q.process(async (job, next) => {
    const graph = await API(job.data.link);
    if (graph.share) {
      const { id, share, og_object } = graph;
      const { id: ogId, ...rest } = og_object;
      const result = await r
        .table(tableName)
        .insert({
          link: id,
          ogId,
          ...rest,
          ...share,
        })
        .run(conn);
      setTimeout(() => next('Insert to db'), 1000);
    } else {
      const err = new Error('No Graph Data');
      next(err);
    }
  });
}

processJob();
