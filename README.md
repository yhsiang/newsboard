# News Billboard

# TODO

* facebook engaements
* trigger flow
* tests
* log
* simple page

# Development

## Directory Structure

```
src
├── crawler               
│   ├── AppleDailyRSS.js
│   └── utils.js
├── facebook.js
└── server.js
```

## Flow

news RSS crawler -> createJob

worker -> processJob

How to aggregate result?

## Schema

### News

```
@title: '水星持續逆行　唐立淇：做事無愧保持平常心',
@link: 'http://www.appledaily.com.tw/realtimenews/article/new/20160905/942357//',
@pubDate: 'Mon, 05 Sep 2016 00:00:00 +0800',
@content: '水星持續逆行　唐立淇：做事無愧保持平常心<br><a href="http://www.appledaily.com.tw/realtimenews/article/new/20160905/942357/">詳全文：水星持續逆行　唐立淇：做事無愧保持平常心</a>',
@contentSnippet: '水星持續逆行　唐立淇：做事無愧保持平常心詳全文：水星持續逆行　唐立淇：做事無愧保持平常心',
@guid: 'http://www.appledaily.com.tw/realtimenews/article/new/20160905/942357//'
@category: new
@origin: appledaily
```

### Engagements


# LICENSE

MIT
