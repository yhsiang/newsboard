import request from "request-promise";
import cheerio from "cheerio";

function parseCategory($) {
  return type => {
    switch (type) {
      case "appledaily": {
        const jsonld = $("script[type='application/ld+json']").text()
        const data = JSON.parse(jsonld)
        return data.keywords
      }
      case "chinatimes": {
        const jsonld = $("script[type='application/ld+json']").text().replace(/　/g," ")
        const data = JSON.parse(jsonld)
        return [data.articleSection]
      }
      case "cna": {
        return [$('.breadcrumb span[itemprop="title"]').last().text()]
      }
      case "ettoday": {
        let category = $('.menu_bread_crumb em').last().text()
        if (!category) category = $('.main_logo').text()
        if (!category) category = $('.logo_sport').text()
        return [category]
      }
      case "ltn": {
        let category = $('.guide a').last().text()
        if (!category) category = $('.conbox_tit.boxTitle a').last().text()
        if (!category) category = $('.sporthead.boxTitle').attr('data-desc')
        if (!category) category = $('.tit').first().text().split("‧")[0]
        return [category]
      }
      case "peoplenews": {
        return [$('.breadcrumb_text').text()]
      }
      case "storm": {
        return $('.tags li').map((_, it) => $(it).text().trim()).toArray()
      }
      case "theinitium": {
        return [$('.channel-section').text()]
      }
      case "udn": {
        return [$("#nav a").last().text()]
      }
      default:
    }
  }
}

export function parseType(url) {
  const [ origin, matched ] = url.match(/https?:\/\/(.*)/)
  const [ host ] = matched.split("/")
  const words = host.split(".")
  if (words.length === 2) return words[0]
  return words[1]
}

export function fetch(url) {
  return request(url)
    .then(rawHtml => {
      const $ = cheerio.load(rawHtml, {
        decodeEntities: false
      });
      return {
        category: parseCategory($)(parseType(url)),
      };
    });
}
