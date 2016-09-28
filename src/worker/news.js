import re from "rethinkdb";
import Queue from "rethinkdb-job-queue";
import { dbOptions, jobOptions } from "../config/db";
import { fetch } from "../crawler/fetch";

const tableName = "News";
const LIMIT = 10;
const q = new Queue(Object.assign({ name: 'News'}, jobOptions));
var connection;

q.on('idle', () => {
  console.log(`== Last time: ${new Date()}, end fetching news data done`);
  connection.close();
  q.stop();
});

console.log(`== Last time: ${new Date()}, start fetching news data done`);
re.connect(dbOptions)
  .then(conn => {
    connection = conn;
    q.process((job, next) => {
      fetch(job.data.id)
        .then(response => {
         return re
          .table(tableName)
          .insert({ ...job.data, ...response }, { conflict: "update" })
          .run(connection);
        })
        .then(() => next('Insert to db'))
        .catch(error => next(error))
    });
  })
