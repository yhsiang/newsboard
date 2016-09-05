import parser from 'rss-parser';
import Promise from 'bluebird';

export function parseURL(url) {
  return new Promise((resolve, reject) => {
    parser.parseURL(url, (err, parsed) => {
      if (err) return reject(err);
      return resolve(parsed);
    });
  });
}
