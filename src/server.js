import express from "express";
import r from "rethinkdb";
import { dbOptions } from "./config/db";

const PORT = process.env.PORT || 5240;
const app = express();

app.get('/', (req, res) => res.send("I am newsboard API"));

app.get('/share', (req, res) => {
  var connection;
  r.connect(dbOptions)
   .then(conn => {
     connection = conn;
     return r
      .table("Graph")
      .orderBy(r.desc("share_count"))
      .limit(10)
      .run(connection);
   })
   .then(results => {
     connection.close();
     return res.json(results);
   });
});

app.get('/comment', (req, res) => {
  var connection;
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
     connection.close();
     return res.json(results);
   });
});

app.listen(PORT, () => console.log(`Server listen at ${PORT}`));
