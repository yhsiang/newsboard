import FeedParser from "feedparser";
import request from "request";
import Promise from "bluebird";
import { createJob } from "../job";

export const baseURL = "http://feeds.feedburner.com";
export const URLs = [
  "/cnaFirstNews",
  "/rsscna/PhotoAlbum",
  "/rsscna/politics",
  "/rsscna/social",
  "/rsscna/lifehealth",
  "/rsscna/finance",
  "/rsscna/intworld",
  "/rsscna/mainland",
  "/rsscna/stars",
  "/rsscna/sport",
  "/rsscna/local",
  "/rsscna/TopNewsforWeek",
  "/rsscna/video",
];
export const origin = "cna";

const uniqueLinks = [];

function singleRequest(url, idx) {
  return new Promise(function(resolve, reject) {
    const news = [];
    var req = request(`${baseURL}${url}`)
      , feedparser = new FeedParser();

    req.on('response', function (res) {
      var stream = this;

      if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

      stream.pipe(feedparser);
    });

    feedparser.on('readable', function() {
      // This is where the action is!
      var stream = this
        , meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance
        , item;

      while (item = stream.read()) {
        const { origlink, title, pubDate, description, summary, guid } = item;
        const link = origlink.replace(/\/$/, "");
        if (uniqueLinks.indexOf(link) > -1) continue;
        uniqueLinks.push(link);

        news.push({
          category: meta.title,
          origin,
          link,
          title,
          pubDate,
          content: summary,
          contentSnippet: description,
          guid,
        })
      }
    });
    feedparser.on('end', function(err) {
      if (err) return reject(err);
      resolve(news);
    });
  });
}


Promise.all(URLs.map(singleRequest)).then(results => {
  const news = results.reduce((acc, cur) => {
    acc = acc.concat(cur);
    return acc;
  } ,[]);
  createJob(news);
});
