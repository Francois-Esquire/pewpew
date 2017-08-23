const os = require('os');
const { join } = require('path');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.PORT = process.env.PORT || 3000;

process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pewpew';
process.env.REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379/1';

process.env.MAILGUN_API_KEY = process.env.MAILGUN_API_KEY || null;
process.env.MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || null;

const debug = process.env.NODE_ENV !== 'production';
const port = process.env.PORT;
const cwd = process.cwd();

const ws = debug ? 'ws://' : 'wss://';
const protocol = debug ? 'http://' : 'https://';
const host = debug ? `localhost:${port}` : 'pew-pew-pew.herokuapp.com';

const urls = {
  redis: process.env.REDIS_URL,
  mongo: process.env.MONGODB_URI,
  host: `${protocol}${host}`,
};

const secrets = new Map([
  ['login', 'Catzzz'],
  ['access', 'Catzzz'],
  ['verify', 'yesitsme'],
  ['restore', 'iforgotmycredentials'],
  ['permit', 'openseseme'],
  ['keys', [
    'ssssseeeecret',
    'ssshhhhhhhhh']]]);

const jwt = {
  algorith: 'HS256',
  audience: urls.host,
  issuer: urls.host,
};

const domains = {
  graphql: 'graphql',
  graphiql: 'graphiql',
  content: 'content',
  upload: 'upload',
};

const temp = {
  content: `${protocol}${host}/${domains.content}`,
  upload: `${protocol}${host}/${domains.upload}`,
  graphql: `${protocol}${host}/${domains.graphql}`,
  graphiql: `${protocol}${host}/${domains.graphiql}`,
  graphqlSub: `${ws}${host}/${domains.graphql}`,
};

const hrefs = {
  logo: `${protocol}${host}/images/pewpew.svg`,
  graphql: temp.graphql || `${protocol}${domains.graphql}.${host}`,
  graphiql: temp.graphiql || `${protocol}${domains.graphql}.${host}/${domains.graphiql}`,
  graphqlSub: temp.graphqlSub || `${ws}${domains.graphql}.${host}`,
  content: `${protocol}${domains.content}.${host}`,
  upload: `${protocol}${domains.upload}.${host}`,
  github: 'https://github.com/Francois-Esquire/pewpew',
};

const paths = {
  assets: join(cwd, 'assets'),
  public: join(cwd, 'dist/public'),
  dist: join(cwd, 'dist'),
  dll: join(cwd, 'dist/dll'),
  server: join(cwd, 'server'),
  schema: join(cwd, 'schema'),
  src: join(cwd, 'src'),
};

Object.assign(paths, {
  queries: join(paths.schema, 'queries'),
  mutations: join(paths.schema, 'mutations'),
  subscriptions: join(paths.schema, 'subscriptions'),
  styles: join(paths.src, 'styles'),
  store: join(paths.src, 'store'),
  apollo: join(paths.src, 'apollo'),
  workers: join(paths.src, 'workers'),
  components: join(paths.src, 'components'),
  favicon: join(paths.public, 'icons/favicon.ico'),
});

const src = {
  favicon: join(paths.assets, 'images/pewpew.svg'),
  stats: {
    bundle: join(paths.dist, 'stats/bundle.json'),
    report: join(paths.dist, 'stats/report.html'),
  },
  server: join(paths.server, 'index.js'),
  render: join(paths.src, 'render/render.js'),
  assets: join(paths.dist, 'assets.json'),
  manifest: join(paths.public, 'manifest.json'),
  service: join(paths.workers, 'service.js'),
  client: (debug ?
    ['webpack-hot-middleware/client?path=/__hmr&timeout=2000&name=app', 'react-hot-loader/patch'] :
    ['babel-polyfill']).concat(join(paths.src, 'index.js')),
  vendor: [
    'redux-form',
    'redux',
    'react',
    'react-dom',
    'react-apollo',
    'react-helmet',
    'react-modal',
    'react-router',
    'react-router-dom',
    'react-redux',
    'prop-types',
    'animejs',
    'approvejs',
    'whatwg-fetch',
    'apollo-client',
    'subscriptions-transport-ws'],
};

const options = {
  clustering: {
    enabled: !debug,
    length: os.cpus().length,
    use: Math.floor(3 * (os.cpus().length / 4)),
  },
};

module.exports = {
  jwt,
  secrets,
  protocol,
  domains,
  host,
  port,
  hrefs,
  paths,
  src,
  urls,
  options,
  debug,
};
