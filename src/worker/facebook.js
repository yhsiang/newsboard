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

q.on('idle', () => {
  console.log(`== Last time: ${new Date()}, end fetching facebook data done`);
  connection.close();
  q.stop();
});

console.log(`== Last time: ${new Date()}, start fetching facebook data done`);
r.connect(dbOptions)
 .then(conn => {
   connection = conn;
   return API('oauth/access_token', authOptions);
 })
 .then(token => {
   fb.setAccessToken(token);
   q.process((job, next) => {
     API(job.data.id)
       .then(graph => {
         if (graph.error) {
           return next(new Error(graph.error.message));
         }
         if (!graph.share) {
           return next(new Error('No Graph Data'));
         }
         const { id, share, og_object } = graph;
         return r
          .table(tableName)
          .insert({
            id,
            ogId: og_object.id,
            title: job.data.title,
            date: job.data.date,
            ...share,
          }, { conflict: "update" })
          .run(connection);
     })
     .then(() => setTimeout(() => next('Insert to db'), 1000));
   });
 });
