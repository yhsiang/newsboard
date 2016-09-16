import { createJob } from "../job";
import r from "rethinkdb";
import { dbOptions, tableName } from "../config/db";

var connection;
r.connect(dbOptions)
 .then(conn => {
   connection = conn;
   return r.table(tableName).filter(news =>
     news("date").gt(r.now().date().sub(187200)) && news("date").lt(r.now().date().sub(7200))
   ).run(conn);
 })
.then(cur => cur.toArray())
.then(results => createJob(results))
.then(() => {
  console.log(`== Last time: ${new Date()}, schedule done`);
  connection.close()
});
