import FeedParser from "feedparser";
import request from "request";
import Promise from "bluebird";
import r from "rethinkdb";
import { dbOptions, tableName } from "../config/db";

function fetch(url) {
  const req = request(url);
  const feedparser = new FeedParser();
  const results = [];

  req.on('response', function(res) {
    if (res.statusCode != 200) {
      return this.emit('error', new Error('Bad status code'));
    }
    this.pipe(feedparser);
  });

  feedparser.on('readable', function() {
    const { meta } = this;
    var item;
    while (item = this.read()) {
      const {
        title,
        date,
      } = item;

      var link = item.link;
      if (item.origlink) {
        link = item.origlink;
      }

      results.push({
        id: link.replace(/\/?\/$/, ''),
        title,
        date,
      });
    }
  });
  return new Promise(resolve => {
    feedparser.on('end', function(err) {
      resolve(results);
    });
  });
}

const urls = [
  'http://www.appledaily.com.tw/rss/newcreate/kind/rnews/type/new',
  'http://www.chinatimes.com/rss/realtimenews.xml',
  'http://feeds.feedburner.com/ettoday/realtime',
  'http://www.peoplenews.tw/rss/%E7%B8%BD%E8%A6%BD',
  'http://www.storm.mg/feeds/all',
  'http://feeds.initium.news/theinitium',
  'http://udn.com/rssfeed/news/1',
];

var connection;
r.connect(dbOptions)
 .then(conn => {
   connection = conn;
   return Promise.all(urls.map(fetch));
 })
 .then(results => {
   const allNews = results.reduce((acc, cur) => {
     acc = acc.concat(cur);
     return acc;
   }, [])
   return r
    .table(tableName)
    .insert(allNews, { conflict: "update" })
    .run(connection);
 })
 .then(result => {
   console.log(`== Last time: ${new Date()}, update ${result.inserted} records.`);
   connection.close();
 });
