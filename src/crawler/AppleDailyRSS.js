import { parseURL } from "../helper/parser";
import Queue from 'rethinkdb-job-queue';
import { jobOptions } from '../config/db';

const ORIGIN = 'appledaily';
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
const q = new Queue(jobOptions);
/*
  @title:          String,
  @link:           String,
  @pubDate:        String, // 'EEE,DD MMM YYYY hh:mm:sss+Z',
  @content:        String, (Escape Html),
  @contentSnippet: String,
  @guid:           String,
  @category:       String, // new
  @origin:         String, // appledaily
*/

export async function createJob() {
  // Start fetch RSS
  const urls = RSSURLS.map(it => (`${baseURL}${it}`));
  const parsedRSS = await Promise.all(urls.map(parseURL));
  const uniqueLinks = [];
  const news = [];
  // End fetch RSS

  parsedRSS.map(({ category, parsed }) =>
    parsed.feed.entries.map(({ link, guid, ...rest }) => {
      const fmtLink = link.replace(/\/$/, "");
      if (uniqueLinks.indexOf(fmtLink) > -1) return;
      uniqueLinks.push(fmtLink);
      news.push({
        category,
        origin: ORIGIN,
        link: fmtLink,
        guid: guid.replace(/\/$/, ""),
        ...rest
      })
    })
  );

  // Start create Job
  const jobs = q.createJob(news.length);
  jobs.map((it, idx) => {
    it.data = news[idx];
    return it;
  });
  const savedJobs = await q.addJob(jobs);
  q.stop();
  // End create Job
}

createJob();
