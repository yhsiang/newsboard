import r from "rethinkdb";
import { parseURL } from "./utils";
import { options } from "../config/db";

const baseURL = "http://www.appledaily.com.tw";

const RSSURLS = [
  "/rss/newcreate/kind/rnews/type/new",
  "/rss/newcreate/kind/rnews/type/recommend",
  "/rss/newcreate/kind/rnews/type/hot",
  "/rss/newcreate/kind/rnews/type/116",
  "/rss/newcreate/kind/rnews/type/117",
  "/rss/newcreate/kind/rnews/type/111",
  "/rss/newcreate/kind/rnews/type/118",
  "/rss/newcreate/kind/rnews/type/video",
  "/rss/newcreate/kind/rnews/type/114",
  "/rss/newcreate/kind/rnews/type/107",
  "/rss/newcreate/kind/rnews/type/115",
  "/rss/newcreate/kind/rnews/type/106",
  "/rss/newcreate/kind/rnews/type/112",
  "/rss/newcreate/kind/rnews/type/105",
  "/rss/newcreate/kind/rnews/type/102",
  "/rss/newcreate/kind/rnews/type/103",
  "/rss/newcreate/kind/rnews/type/104",
  "/rss/newcreate/kind/rnews/type/119",
  "/rss/newcreate/kind/rnews/type/101",
  "/rss/newcreate/kind/rnews/type/113",
];

/*
  @title: '水星持續逆行　唐立淇：做事無愧保持平常心',
  @link: 'http://www.appledaily.com.tw/realtimenews/article/new/20160905/942357//',
  @pubDate: 'Mon, 05 Sep 2016 00:00:00 +0800',
  @content: '水星持續逆行　唐立淇：做事無愧保持平常心<br><a href="http://www.appledaily.com.tw/realtimenews/article/new/20160905/942357/">詳全文：水星持續逆行　唐立淇：做事無愧保持平常心</a>',
  @contentSnippet: '水星持續逆行　唐立淇：做事無愧保持平常心詳全文：水星持續逆行　唐立淇：做事無愧保持平常心',
  @guid: 'http://www.appledaily.com.tw/realtimenews/article/new/20160905/942357//'
  @category: new
  @origin: appledaily
*/

export async function fetch() {
  console.log('Start to fetch all RSS');
  const parsedRSS = await Promise.all(RSSURLS.map(parseURL));
  console.log('Fetch all RSS done');
  const news = parsedRSS.reduce((acc, cur) => {
    acc = acc.concat(cur.feed.entries.map(it => ({
      category: 'new',
      origin: 'appledaily',
      ...it,
    })));
    return acc;
  }, []);
  console.log('Start to store all news');
  const conn = await r.connect(options);
  const result = await r.table('news').insert(news).run(conn);
  console.log('Store all news done');
  conn.close();
}

fetch();
