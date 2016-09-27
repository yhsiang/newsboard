import express from "express";
import r from "rethinkdb";
import { dbOptions } from "./config/db";
import moment from "moment";

const PORT = process.env.PORT || 5240;
const day = 86400;
const app = express();
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  var connection, comments;
  r.connect(dbOptions)
   .then(conn => {
     connection = conn;
     return r
      .table("Graph")
      .filter(news => news("date").gt(r.now().date().sub(day)))
      .orderBy(r.desc("comment_count"))
      .limit(10)
      .run(connection);
   })
   .then(results => {
     comments = results;
     return r
      .table("Graph")
      .filter(news => news("date").gt(r.now().date().sub(day)))
      .orderBy(r.desc("share_count"))
      .limit(10)
      .run(connection);
   })
   .then(results => {
     res.render("index.ejs", {
       title: `${moment().format("MM/DD/YYYY")} 24 小時內熱門新聞整理`,
       shares: results,
       comments,
       moment,
     });
   })
});

app.get('/48', (req, res) => {
  var connection, comments;
  r.connect(dbOptions)
   .then(conn => {
     connection = conn;
     return r
      .table("Graph")
      .filter(news => news("date").gt(r.now().date().sub(2*day)))
      .orderBy(r.desc("comment_count"))
      .limit(10)
      .run(connection);
   })
   .then(results => {
     comments = results;
     return r
      .table("Graph")
      .filter(news => news("date").gt(r.now().date().sub(2*day)))
      .orderBy(r.desc("share_count"))
      .limit(10)
      .run(connection);
   })
   .then(results => {
     res.render("index.ejs", {
       title: `${moment().format("MM/DD/YYYY")} 48 小時內熱門新聞整理`,
       shares: results,
       comments,
       moment,
     });
   })
});

app.get('/admin', (req, res) => {
  var connection, comments;
  r.connect(dbOptions)
   .then(conn => {
     connection = conn;
     return r
      .table("Graph")
      .filter(news => news("date").gt(r.now().date().sub(5*day)))
      .run(connection);
   })
   .then(cur => cur.toArray())
   .then(results => {
     res.render("admin.ejs", {
       data: results,
       moment,
     });
   })
});

app.listen(PORT, () => console.log(`Server listen at ${PORT}`));
