import Promise from 'bluebird';
import { Facebook } from 'fb';

const fbOptions = {
  appId: process.env.AppId,
  appSecret: process.env.AppSecret,
  version: 'v2.7',
};

const fb = new Facebook(fbOptions);

export function API(url, options) {
  return new Promise((resolve) => {
    if (options) {
      return fb.api(url, options, res => resolve(res.access_token));
    }
    return fb.api(url, res => resolve(res));
  });
}

export default fb;
