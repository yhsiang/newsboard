export const dbOptions = {
  host: 'localhost',
  port: 28015,
  db: 'newsboard',
};

export const jobOptions = {
  db: 'JobQueue',
  name: 'News',
  retryDelay: 1000,
};
