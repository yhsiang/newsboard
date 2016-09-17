import express from "express";
import r from "rethinkdb";
import { dbOptions } from "./config/db";
import moment from "moment";

const PORT = process.env.PORT || 5240;
const app = express();
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  var connection, comments;
  r.connect(dbOptions)
   .then(conn => {
     connection = conn;
     return r
      .table("Graph")
      .orderBy(r.desc("comment_count"))
      .limit(10)
      .run(connection);
   })
   .then(results => {
     comments = results;
     return r
      .table("Graph")
      .orderBy(r.desc("share_count"))
      .limit(10)
      .run(connection);
   })
   .then(results => {
     res.render("index.ejs", {
       title: `${moment().format("MM-DD")} 排行`,
       shares: results,
       comments,
       moment,
     });
   })

});

app.listen(PORT, () => console.log(`Server listen at ${PORT}`));
