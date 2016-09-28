import request from "request-promise";
import cheerio from "cheerio";
import { createJob } from "../job";

const baseURL = "http://www.setn.com"
const URL = `${baseURL}/ViewAll.aspx?p=`;
const origin = "setn";
const pages = [1, 2, 3, 4, 5];

async function fetch(url) {
  const htmlString = await request(url);
  const $ = cheerio.load(htmlString);
  const year = (new Date()).getFullYear();

  return $(".box ul li").map((i, it) => ({
    title: $(it).children("a").text(),
    link: `${baseURL} ${$(it).children("a").attr("href")}`,
    pubDate: `${year} ${$(it).children(".tab_list_time").text()}`,
    category: $(it).children(".tab_list_type").text(),
  })).toArray();
}


export async function execute() {
  const results = await Promise.all(
    pages
      .map(p => `${URL}${p}`)
      .map(fetch)
  );

  const items =  results.reduce((acc, cur) => {
    acc = acc.concat(cur)
    return acc;
  }, []);

  createJob(items);
}
