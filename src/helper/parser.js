import parser from 'rss-parser';
import Promise from 'bluebird';

function parseURL(url) {
  return new Promise((resolve, reject) => {
    parser.parseURL(url, (err, parsed) => {
      if (err) return reject({ url, err });
      return resolve(parsed);
    });
  });
}

export async function aggregate({ baseURL, URLs, origin }) {
  const urls = URLs.map(it => (`${baseURL}${it}`));
  const parsedRSS = await Promise.all(urls.map(parseURL));
  const uniqueLinks = [];
  const news = [];

  parsedRSS.map(rss =>
    rss.feed.entries.map(({ link, ...rest }) => {
      let fmtLink = link.replace(/\/$/, "");
      if (origin === 'ettoday' || origin === 'theinitium') {
        fmtLink = rest.guid.replace(/\/$/, "");
      }
      if (uniqueLinks.indexOf(fmtLink) > -1) return;
      uniqueLinks.push(fmtLink);
      news.push({
        category: rss.title,
        origin,
        link: fmtLink,
        ...rest
      })
    })
  );

  return news;
}
