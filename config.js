const debug = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;

module.exports = {
  protocol: debug ? 'http://' : 'https://',
  host: debug ? `localhost:${port}/` : 'pew-pew-pew.herokuapp.com',
  port,
  paths: {
    graphql: '/graphql',
  },
  debug,
};
