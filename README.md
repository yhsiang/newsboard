# News Billboard

## Requirement

* nodejs
* rethinkdb

# TODO

* tests
* log
* simple page

# News
  hourly fetch
 * http://www.appledaily.com.tw/rss/newcreate/kind/rnews/type/new
 * http://www.chinatimes.com/rss/realtimenews.xml
 * http://feeds.feedburner.com/ettoday/realtime
 * http://www.peoplenews.tw/rss/%E7%B8%BD%E8%A6%BD
 * http://www.storm.mg/feeds/all
 * http://feeds.initium.news/theinitium
 * http://udn.com/rssfeed/news/1

 * cna: all RSS
 * ltn: all RSS


# Development

## Directory Structure

```
src
├── config
│   └── db.js
├── crawler
│   └── executor.js
├── fetch.js
├── helper
│   ├── facebook.js
│   └── parser.js
├── job.js
├── server.js
├── sites
│   ├── appledaily.js
│   ├── chinatimes.js
│   ├── ltn.js
│   └── udn.js
└── worker
    └── facebook.js
```

## Flow

news RSS crawler -> createJob

worker -> processJob

How to aggregate result?

## Schema

### News

```
  @title:          String,
  @link:           String,
  @pubDate:        String, // 'EEE,DD MMM YYYY hh:mm:sss+Z',
  @content:        String, (Escape Html),
  @contentSnippet: String,
  @guid:           String,
  @category:       String, // new
  @origin:         String, // appledaily
```

### Graphs

```
{
  ogId
  description
  title
  type
  updated_time
  comment_count
  share_count
  link
}
```

# LICENSE

MIT
