const { join } = require('path');

const debug = process.env.NODE_ENV !== 'production';
// eslint-disable-next-line camelcase
const unix_socket = process.env.UNIX_SOCKET || null;
const port = process.env.PORT || 3000;
const cwd = process.cwd();

const redis = process.env.REDIS_URL;

const ws = debug ? 'ws://' : 'wss://';
const protocol = debug ? 'http://' : 'https://';
const host = debug ? `localhost:${port}/` : 'pew-pew-pew.herokuapp.com';

const domains = {
  graphql: 'graphql',
  graphiql: 'graphiql',
  content: 'content',
  upload: 'upload',
};

module.exports = {
  unix_socket,
  protocol,
  domains,
  host,
  port,
  hrefs: {
    graphql: `${protocol}${domains.graphql}.${host}`,
    graphiql: `${protocol}${domains.graphiql}.${host}`,
    graphqlSub: `${ws}${domains.graphql}.${host}`,
    content: `${protocol}${domains.content}.${host}`,
    upload: `${protocol}${domains.upload}.${host}`,
  },
  paths: {
    assets: join(cwd, 'assets'),
    public: join(cwd, 'dist/public'),
    dist: join(cwd, 'dist'),
    src: join(cwd, 'src'),
    dll: join(cwd, 'dist/dll'),
  },
  keys: ['ssssseeeecret', 'ssshhhhhhhhh'],
  urls: {
    redis,
  },
  debug,
};
