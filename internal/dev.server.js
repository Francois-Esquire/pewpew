const mongoose = require('mongoose');
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
  require('redis').debug_mode = false;
  const cwd = process.cwd();
  const sockets = [];
  const models = [];
  let assets = {};
  let server;

  const webpack = require('./dev.webpack')(({ css, scripts, meta, hash }) => {
    assets = { css, scripts, meta, hash };

    restartServer();
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
      // print.log(chalk`new socket connection: ${socket.id}`);
      const socketId = sockets.length;
      sockets[socketId] = socket;
      socket.on('close', () => sockets.splice(socketId, 1));
    });

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
    if (server && server.listening) {
      models.forEach(releaseModel);
      if (sockets.length) sockets.forEach(socket => socket.destroy());
      server.close(() => print.report(chalk`\n\t{yellow Server closed.}\n\tRestarting!`));
    }

    process.nextTick(serve);
  }

  require('./dev.sentry')((sentry, files, handler) => {
    files.forEach(src => src.startsWith('server/models') && models.push(src));
    return handler((event, src) => {
      switch (event) {
        default: break;
        case 'add': {
          if (src.startsWith('server/models')) models.push(src);
          break;
        }
        case 'unlink': {
          if (src.startsWith('server/models')) models.splice(models.indexOf(src), 1);
          break;
        }
        case 'change': {
          if (src === 'dist/render.js') delete require.cache[`${cwd}/dist/render.js`];

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

  process.stdout.on('data', (chunk) => {
    if (chunk !== null) {
      print.report(chalk`\tstdout - chunk: ${chunk}`);
      process.stdout.write(`data: ${chunk}`);
    }
  });

  process.stdin.on('readable', () => {
    const chunk = process.stdin.read();
    if (chunk !== null) {
      process.stdout.write(`data: ${chunk}`);
    }
  });

  print.report(chalk`\tStarting Development Server.`);
  return serve();
};
