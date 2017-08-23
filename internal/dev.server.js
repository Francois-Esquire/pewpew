const mongoose = require('mongoose');
const chalk = require('chalk');

const sockets = require('./manager.socket');

module.exports = async function development() {
  const cwd = process.cwd();
  const models = new Set();
  let initialized = false;
  let server = null;

  require('redis').debug_mode = false;
  const webpack = await require('./dev.webpack')();

  const serve = async () => {
    if (initialized === false) initialized = true;

    server = await require('../dist/server')({
      emails: require('../dist/emails.js'),
      render: require('../dist/render'),
      assets: webpack.assets,
      webpack,
    });

    server
      .on('subscription.connect', socket => sockets.connect(socket, 'subscription'))
      .on('connection', socket => sockets.connect(socket))
      .on('listnening', () => webpack.publish({
        name: webpack.config.name,
        target: 'server',
        action: 'listening',
        time: Date.now(),
      }));

    return server;
  };

  function releaseModel(src) {
    const name = src.replace('server/models/', '').replace('.js', '');
    const [a, ...b] = name;
    const modelName = `${a.toUpperCase()}${b.join('').replace(/s$/, '')}`;

    if (mongoose.connection.collections[name]) {
      delete mongoose.models[modelName];
      delete mongoose.connection.collections[name];
      delete mongoose.modelSchemas[modelName];
    }
  }

  function restartServer() {
    if (initialized) {
      if (server && server.listening) {
        sockets.purge();
        server.close(() => print.report(chalk`\n\t{yellow Server closed.}\n\tRestarting!`));
        models.forEach(releaseModel);
      }

      process.nextTick(serve);
    }
  }

  require('./dev.sentry')([
    './dist/*.js',
    './server/models/*.js'], {
    cwd,
  }, (sentry, files, handler) => {
    files.forEach(src => src.startsWith('server/models') && models.add(src));
    return handler((event, src) => {
      switch (event) {
        default: break;
        case 'add': {
          if (src.startsWith('server/models')) models.add(src);
          break;
        }
        case 'unlink': {
          if (src.startsWith('server/models')) models.delete(src);
          break;
        }
        case 'change': {
          if (src === 'dist/render.js') {
            delete require.cache[`${cwd}/dist/render.js`];
          } else if (src === 'dist/server.js') delete require.cache[`${cwd}/dist/server.js`];

          setTimeout(restartServer, 2500);

          webpack.publish({
            name: webpack.config.name,
            target: 'server',
            action: 'updating',
            time: Date.now(),
          });

          break;
        }
      }
    });
  });

  return serve();
};
