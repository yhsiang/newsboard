import { createJob } from "../job";
import r from "rethinkdb";
import { dbOptions } from "../config/db";

export const tableName = "News";

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
.then(() => connection.close());
