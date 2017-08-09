const chalk = require('chalk');

module.exports = ({
  protocol,
  domains,
  host,
  port,
  paths,
  hrefs,
  keys,
  urls,
  print,
  debug,
}) => {
  require('redis').debug_mode = true;
  const cwd = process.cwd();
  const sockets = [];
  let assets = {};
  let server;

  const webpack = require('./dev.webpack')(({ css, scripts, meta, hash }) => {
    assets = { css, scripts, meta, hash };
  }, { paths, print });

  const serve = async () => {
    server = await require('../dist/server')({
      protocol,
      domains,
      host,
      port,
      paths,
      hrefs,
      keys,
      urls,
      render: require('../dist/render.js'),
      assets,
      print,
      debug,
      webpack,
    });

    server.on('connection', (socket) => {
      print.log(chalk`new socket connection: ${socket.id}`);
      const socketId = sockets.length;
      sockets[socketId] = socket;
      socket.on('close', () => sockets.splice(socketId, 1));
    });

    return server;
  };

  function restartServer() {
    if (server && server.listening) {
      if (sockets.length) sockets.forEach(socket => socket.destroy());
      server.close(() => print.report(chalk`\n\t{yellow Server closed.}\n\tRestarting!`));
    }

    process.nextTick(serve);
  }

  require('./dev.sentry')((sentry, cb) => {
    const mongoose = require('mongoose');

    return cb((event, src) => {
      switch (event) {
        default: break;
        case 'change': {
          if (src === 'dist/render.js') delete require.cache[`${cwd}/dist/render.js`];
          else if (/server\/models\/.*\.js/.test(src)) {
            delete require.cache[`${cwd}/${src}`];

            const name = src.replace('server/models/', '').replace('.js', '');
            const [a, ...b] = name;
            const modelName = `${a.toUpperCase()}${b.join('').replace(/s$/, '')}`;

            delete mongoose.models[modelName];
            delete mongoose.connection.collections[name];
            delete mongoose.modelSchemas[modelName];

            print.report(` Updating Mongoose model {bold ${modelName} }`);

            process.nextTick(require, `./server/models/${name}.js`);
          }

          delete require.cache[`${cwd}/dist/server.js`];

          restartServer();
          break;
        }
      }
    });
  }, [
    './dist/*.js',
    './server/models/*.js'], {
    print,
    options: {
      cwd,
    },
  });

  return serve();
};
