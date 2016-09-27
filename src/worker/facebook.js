import fb, { API } from "../helper/facebook";
import re from "rethinkdb";
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
re.connect(dbOptions)
  .then(conn => {
    connection = conn;
    return API('oauth/access_token', authOptions);
  })
  .then(token => {
    fb.setAccessToken(token);
    q.process((job, next) => {
      API(`/?ids=${job.data.ids}`)
        .then(response => {
          if (response.error) {
            return next(new Error(response.error.message));
          }
          const graphs =
            Object
              .keys(response)
              .map(key => {
                if (!response[key].share) return { id: key };
                const { id, share, og_object } = response[key];
                return {
                  ogId: og_object.id,
                  ...job.data[key],
                  ...share,
                };
              })
              .filter(it => it.share_count);
         return re
          .table(tableName)
          .insert(graphs, { conflict: "update" })
          .run(connection);
        })
        .then(() => setTimeout(() => next('Insert to db'), 1000));
    });
  });
