const { join } = require('path');

const debug = process.env.NODE_ENV !== 'production';
// eslint-disable-next-line camelcase
const unix_socket = process.env.UNIX_SOCKET || null;
const port = process.env.PORT || 3000;
const cwd = process.cwd();

module.exports = {
  unix_socket,
  protocol: debug ? 'http://' : 'https://',
  host: debug ? `localhost:${port}/` : 'pew-pew-pew.herokuapp.com',
  port,
  paths: {
    dll: join(cwd, 'dist/dll'),
    src: join(cwd, 'src'),
    dist: join(cwd, 'dist'),
  },
  endpoints: {
    graphql: 'graphql',
    graphiql: 'graphiql',
  },
  debug,
};
