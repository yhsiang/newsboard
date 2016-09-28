import request from "request-promise";
import cheerio from "cheerio";

function fetch(url) {
  return request(url)
    .then(response => {
      const $ = cheerio.load(response, {
        decodeEntities: false
      });
      return {
        category: parseCategory($),
        rawContent: parseContent($),
        figures: parseFigure($),
        type: 'appledaily',
      };
    });
}

// Cheerio -> String
function parseCategory($) {
  const jsonld = $("script[type='application/ld+json']").text()
  const data = JSON.parse(jsonld)
  return data.keywords[0]
}

function parseContent($) {
  $("iframe").remove()
  return $("#summary").html()
}

function parseFigure($) {
  const imgUrls = $('.lbimg img').map((i, it) => $(it).attr("src"))
  const captions = $('p[id*="caption"]').map((i, it) => $(it).text())
  return imgUrls.map((url, i) => ({
    url,
    caption: captions[i],
  })).toArray()
}

function parseEngage($) {
  const [ clickName, clicks ] =
    $('.function_icon.clicked').text().replace(")", "").split("(")
  const [ forwardName, forwards ] =
    $('.function_icon.forward').text().replace(")", "").split("(")
  const [ quoteName, quotes ] =
    $('.function_icon.quote').text().replace(")", "").split("(")
  return { clicks, forwards, quotes }
}
