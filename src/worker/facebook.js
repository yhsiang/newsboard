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
var connection;

q.on('completed', jobId => console.log(`${new Date()} Job completed: ${jobId}`));
q.on('failed', jobId => console.log(`${new Date()} Job Failed: ${jobId}`));
q.on('idle', () => connection.close());

r.connect(dbOptions)
 .then(conn => API('oauth/access_token', authOptions))
 .then(token => {
   fb.setAccessToken(token);
   console.log('Auth done!');
   q.process((job, next) => {
     API(job.data.link)
       .then(graph => {
         if (graph.error) {
           return next(new Error(graph.error.message));
         }
         if (!graph.share) {
           return next(new Error('No Graph Data'));
         }
         const { id, share, og_object } = graph;
         const { id: ogId, ...rest } = og_object;
         return r
          .table(tableName)
          .insert({
            id,
            ogId,
            ...rest,
            ...share,
          })
          .run(connection);
     })
     .then(() => setTimeout(() => next('Insert to db'), 1000));
   });
 });
