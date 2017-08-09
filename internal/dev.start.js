const cluster = require('cluster');
const chalk = require('chalk');

module.exports = async function start({
  protocol,
  domains,
  host,
  port,
  paths,
  hrefs,
  keys,
  urls,
  print,
  debug = true,
  webpack,
  assets,
}) {
  const sockets = [];
  const server = await require('../dist/server')({
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

  if (cluster.isWorker) {
    process.on('message', (message) => {
      const [type, action] = message.split('.');
      switch (type) {
        default: return process.send(`${type}.${action}`);
        case 'restart': {
          return cluster.worker.kill();
        }
      }
    });
  }

  return server;
};
