import { createJob } from "../jobs/facebook";
import r from "rethinkdb";
import { dbOptions, tableName } from "../config/db";

const fbLimit = 50;

var connection;
var length;
r.connect(dbOptions)
 .then(conn => {
   connection = conn;
   return r
    .table(tableName)
    .orderBy(r.desc("date"))
    .limit(30000)
    .run(conn);
 })
.then(cur => cur.toArray())
.then(results => {
  const reduced =
    results
      .reduce((acc, cur, idx) => {
        const index = parseInt(idx / 50, 10);
        if (!acc[index]) acc[index] = { ids: "", news: {} };
        acc[index]["ids"] += `${cur.id},`;
        acc[index][cur.id] = {
          title: cur.title,
          id: cur.id,
          date: cur.date,
          category: cur.category,
        };
        return acc;
      }, [])
      .map(it => {
        it.ids = it.ids.replace(/,$/, "");
        return it;
      })
  length = reduced.length;
  createJob(reduced);
})
.then(() => {
  console.log(`== Last time: ${new Date()}, schedule ${length} records.`);
  connection.close()
});
