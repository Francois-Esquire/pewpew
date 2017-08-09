const os = require('os');
const { join } = require('path');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.PORT = process.env.PORT || 3000;

process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pewpew';
process.env.REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379/1';

const debug = process.env.NODE_ENV !== 'production';
const port = process.env.PORT;
const cwd = process.cwd();

const urls = {
  redis: process.env.REDIS_URL,
  mongo: process.env.MONGODB_URI,
};

const keys = ['ssssseeeecret', 'ssshhhhhhhhh'];

const paths = {
  assets: join(cwd, 'assets'),
  public: join(cwd, 'dist/public'),
  dist: join(cwd, 'dist'),
  src: join(cwd, 'src'),
  dll: join(cwd, 'dist/dll'),
};

paths.favicon = `${paths.public}/icons/favicon.ico`;

const ws = debug ? 'ws://' : 'wss://';
const protocol = debug ? 'http://' : 'https://';
const host = debug ? `localhost:${port}` : 'pew-pew-pew.herokuapp.com';

const domains = {
  graphql: 'graphql',
  graphiql: 'graphiql',
  content: 'content',
  upload: 'upload',
};

const temp = {
  graphql: `${protocol}${host}/${domains.graphql}`,
  graphiql: `${protocol}${domains.graphql}.${host}/${domains.graphiql}`,
  graphqlSub: `${ws}${host}/${domains.graphql}`,
};

const hrefs = {
  graphql: temp.graphql || `${protocol}${domains.graphql}.${host}`,
  graphiql: temp.graphiql || `${protocol}${domains.graphql}.${host}/${domains.graphiql}`,
  graphqlSub: temp.graphqlSub || `${ws}${domains.graphql}.${host}`,
  content: `${protocol}${domains.content}.${host}`,
  upload: `${protocol}${domains.upload}.${host}`,
};

const options = {
  clustering: {
    enabled: !debug,
    length: os.cpus().length,
    // use: Math.floor(3 * (os.cpus().length / 4)),
  },
};

module.exports = {
  protocol,
  domains,
  host,
  port,
  hrefs,
  paths,
  keys,
  urls,
  options,
  debug,
};
