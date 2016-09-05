import fb, { API } from "./helper/facebook";
import r from "rethinkdb";
import { options } from "./config/db";

const LIMIT = 10;

const authOptions ={
  client_id: process.env.AppId,
  client_secret: process.env.AppSecret,
  grant_type: 'client_credentials',
};

/*
{
  og_object {
    id
    description
    title
    type
    updated_time
  }
  share {
    comment_count
    share_count
  }
  id
}
*/

async function fetch() {
  const conn = await r.connect(options);
  const cursor = await r.table('news').pluck('link').limit(LIMIT).run(conn);
  const news = await cursor.toArray();
  const links = news.map(it =>it.link.replace(/\/$/, ''));
  console.log(`get ${LIMIT} links`);
  // FIXME: handle auth error
  const token = await API('oauth/access_token', authOptions);
  fb.setAccessToken(token);
  console.log('Auth done!');
  const graphs = await Promise.all(links.map(API));
  // FIXME: handle error
  const result = await r.table('graphs').insert(graphs).run(conn);
  conn.close();
}

fetch();
