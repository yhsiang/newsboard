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
        if (!category) category = $('meta[name="section"]').attr('content')
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
      case "bbc": {
        let category = $('.mini-info-list__section').first().text().replace(/&amp;/, '&')
        if (!category) category = $('.global-header__logo .vh').text()
        if (!category) category = $('.selected a').first().text().trim()
        return [category]
      }
      case "nytimes": {
        let category = $('.kicker-label').first().text().trim()
        if (!category) category = $('.branding .second').text()
        if (!category) category = $('.branding-heading').text().trim()
        return [category]
      }
      case "economist": {
        let category = $('.blog-post-header h2').text()
        if (!category) category = $('.ec-article-info').text()
        if (category.match(/:/)) category = category.split(":")[1].trim()
        if (!category) category = $('.source').first().text()
        return [category]
      }
      case "washingtonpost": {
        let category = $('.headline-kicker').text()
        if (!category) category = $('.menu-label.menu-title').text().trim()
        return [category]
      }
      default:
    }
  }
}

function parseDate($) {
  return type => {
    switch (type) {
      case "washingtonpost": {
        let date = $('.pb-timestamp').attr('content')
        if (!date) {
          let content = $('#video-header-module-container meta[itemprop="duration"]').attr('content')
          let $$ = cheerio.load(content)
          date = $$('small.date').text()
        }
        return date
      }
      default:
    }
  }
}

export function parseType(url) {
  const [ origin, matched ] = url.match(/https?:\/\/(.*)/)
  const [ host ] = matched.split("/")
  const words = host.split(".")
  if (words[0].match(/well/)) return words[2]
  if (words.length === 2) return words[0]
  return words[1]
}

export function fetch(url) {
  const type = parseType(url)
  return request({
    url,
    jar: true,
  })
  .then(rawHtml => {
    const $ = cheerio.load(rawHtml, {
      decodeEntities: false
    });
    // FIXME: washingtonpost should also parseDate
    return {
      category: parseCategory($)(type),
    };
  });
}
