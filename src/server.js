import express from "express";
import r from "rethinkdb";
import { dbOptions } from "./config/db";
import moment from "moment";

const PORT = process.env.PORT || 5240;
const day = 86400;
const app = express();
app.set('view engine', 'ejs');

const filterOther = n =>
  r.or(
    n.eq("東推西推"),
    n.eq("即時新聞"),
    n.eq("娛樂"),
    n.eq("政治"),
    n.eq("娛樂星光雲"),
  )

app.get('/', (req, res) => {
  var connection, otherExcludeEntComments, otherExcludeEntShares, comments;
  r.connect(dbOptions)
   .then(conn => {
     connection = conn;
     return r
      .table("Graph")
      .filter(
        r.and(
          r.row("date").gt(r.now().date().sub(day)),
          r.row("category").contains(filterOther).not()
        )
      )
      .orderBy(r.desc("comment_count"))
      .run(connection);
   })
   .then(results => {
     otherExcludeEntComments = results.slice(0, 10);
     return r
      .table("Graph")
      .filter(
        r.and(
          r.row("date").gt(r.now().date().sub(day)),
          r.row("category").contains(filterOther).not()
        )
      )
      .orderBy(r.desc("share_count"))
      .run(connection);
   })
   .then(results => {
     otherExcludeEntShares = results.slice(0, 10);
     return r
      .table("Graph")
      .filter(
        r.and(
          r.row("date").gt(r.now().date().sub(day)),
          r.row("category").contains("政治")
        )
      )
      .orderBy(r.desc("comment_count"))
      .run(connection);
   })
   .then(results => {
     comments = results.slice(0, 10);
     return r
      .table("Graph")
      .filter(
        r.and(
          r.row("date").gt(r.now().date().sub(day)),
          r.row("category").contains("政治")
        )
      )
      .orderBy(r.desc("share_count"))
      .run(connection);
   })
   .then(results => {
     res.render("index.ejs", {
       title: `${moment().format("MM/DD/YYYY")} 24 小時內熱門新聞整理`,
       shares: results.slice(0, 10),
       comments,
       otherExcludeEntShares,
       otherExcludeEntComments,
       moment,
     });
   })
});

app.get('/48', (req, res) => {
  var connection, otherExcludeEntComments, otherExcludeEntShares, comments;
  r.connect(dbOptions)
   .then(conn => {
     connection = conn;
     return r
      .table("Graph")
      .filter(
        r.and(
          r.row("date").gt(r.now().date().sub(2*day)),
          r.row("category").contains(filterOther).not()
        )
      )
      .orderBy(r.desc("comment_count"))
      .run(connection);
   })
   .then(results => {
     otherExcludeEntComments = results.slice(0, 10);
     return r
      .table("Graph")
      .filter(
        r.and(
          r.row("date").gt(r.now().date().sub(2*day)),
          r.row("category").contains(filterOther).not()
        )
      )
      .orderBy(r.desc("share_count"))
      .run(connection);
   })
   .then(results => {
     otherExcludeEntShares = results.slice(0, 10);
     return r
      .table("Graph")
      .filter(
        r.and(
          r.row("date").gt(r.now().date().sub(2*day)),
          r.row("category").contains("政治")
        )
      )
      .orderBy(r.desc("comment_count"))
      .run(connection);
   })
   .then(results => {
     comments = results.slice(0, 10);
     return r
      .table("Graph")
      .filter(
        r.and(
          r.row("date").gt(r.now().date().sub(2*day)),
          r.row("category").contains("政治")
        )
      )
      .orderBy(r.desc("share_count"))
      .run(connection);
   })
   .then(results => {
     res.render("index.ejs", {
       title: `${moment().format("MM/DD/YYYY")} 48 小時內熱門新聞整理`,
       shares: results.slice(0, 10),
       comments,
       otherExcludeEntShares,
       otherExcludeEntComments,
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
