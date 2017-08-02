const debug = process.env.NODE_ENV !== 'production';
// eslint-disable-next-line camelcase
const unix_socket = process.env.UNIX_SOCKET || null;
const port = process.env.PORT || 3000;

module.exports = {
  unix_socket,
  protocol: debug ? 'http://' : 'https://',
  host: debug ? `localhost:${port}/` : 'pew-pew-pew.herokuapp.com',
  port,
  paths: {
    graphql: '/graphql',
  },
  debug,
};
