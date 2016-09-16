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
        id: link.replace(/\/\/$/, '/'),
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
  "http://www.appledaily.com.tw/rss/newcreate/kind/rnews/type/new",
  "http://www.chinatimes.com/rss/realtimenews.xml",
  "http://feeds.feedburner.com/ettoday/realtime",
  "http://www.peoplenews.tw/rss/%E7%B8%BD%E8%A6%BD",
  "http://www.storm.mg/feeds/all",
  "http://feeds.initium.news/theinitium",
  "http://udn.com/rssfeed/news/1",
  "http://feeds.feedburner.com/rsscna/PhotoAlbum",
  "http://feeds.feedburner.com/rsscna/politics",
  "http://feeds.feedburner.com/rsscna/social",
  "http://feeds.feedburner.com/rsscna/lifehealth",
  "http://feeds.feedburner.com/rsscna/finance",
  "http://feeds.feedburner.com/rsscna/intworld",
  "http://feeds.feedburner.com/rsscna/mainland",
  "http://feeds.feedburner.com/rsscna/stars",
  "http://feeds.feedburner.com/rsscna/sport",
  "http://feeds.feedburner.com/rsscna/local",
  "http://feeds.feedburner.com/rsscna/TopNewsforWeek",
  "http://feeds.feedburner.com/rsscna/video",
  "http://news.ltn.com.tw/rss/focus.xml",
  "http://news.ltn.com.tw/rss/politics.xml",
  "http://news.ltn.com.tw/rss/society.xml",
  "http://news.ltn.com.tw/rss/life.xml",
  "http://news.ltn.com.tw/rss/opinion.xml",
  "http://news.ltn.com.tw/rss/world.xml",
  "http://news.ltn.com.tw/rss/business.xml",
  "http://news.ltn.com.tw/rss/sports.xml",
  "http://news.ltn.com.tw/rss/entertainment.xml",
  "http://news.ltn.com.tw/rss/consumer.xml",
  "http://news.ltn.com.tw/rss/supplement.xml",
  "http://news.ltn.com.tw/rss/local.xml",
  "http://news.ltn.com.tw/rss/taipei.xml",
  "http://news.ltn.com.tw/rss/northern.xml",
  "http://news.ltn.com.tw/rss/central.xml",
  "http://news.ltn.com.tw/rss/southern.xml",
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
