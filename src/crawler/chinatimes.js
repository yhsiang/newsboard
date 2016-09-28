import request from "request-promise";
import cheerio from "cheerio";

function fetch(url) {
  return request(url)
    .then(response => {
      const $ = cheerio.load(response, {
        decodeEntities: false
      });
      // console.log(response)
      return {
        category: parseCategory($),
        rawContent: parseContent($),
        figures: parseFigure($),
        type: 'chinatimes',
      };
    });
}

// Cheerio -> String
function parseCategory($) {
  const jsonld = $("script[type='application/ld+json']").text().replace("　"," ")
  const data = JSON.parse(jsonld)
  return data.articleSection
}

function parseContent($) {
  return $("article p").map((i, it) => $(it).html()).toArray().join('\n')
}

function parseFigure($) {
  const imgUrls = $('figure img').map((i, it) => $(it).attr("src"))
  const captions = $('figure figcaption').map((i, it) => $(it).text())
  return imgUrls.map((url, i) => ({
    url,
    caption: captions[i],
  })).toArray()
}

function parseEngage($) {
  const clicks = $('.art_click .num').first().text();
  // FIXME: disqu comments, stars
  return { clicks }
}

const urls = [
  "http://www.chinatimes.com/realtimenews/20160928004572-260404",
  "http://www.chinatimes.com/realtimenews/20160928004561-260404",
  "http://www.chinatimes.com/realtimenews/20160928004547-260408",
  "http://www.chinatimes.com/realtimenews/20160928004557-260409",
  "http://www.chinatimes.com/realtimenews/20160928004564-260408",
  "http://www.chinatimes.com/realtimenews/20160928003696-260404",
]
