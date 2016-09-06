# News Billboard

## Requirement

* nodejs
* rethinkdb

# TODO

* tests
* log
* simple page

# Development

## Directory Structure

```
src
├── config
│   └── db.js
├── crawler
│   └── AppleDailyRSS.js
├── helper
│   ├── facebook.js
│   └── parser.js
├── server.js
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
