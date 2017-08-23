const cluster = require('cluster');

module.exports = async function start() {
  let webpack;
  let assets;

  const server = await require('../dist/server')({
    emails: require('../dist/emails.js'),
    render: require('../dist/render.js'),
    assets,
    webpack,
  });

  if (cluster.isWorker) {
    process.on('message', (message) => {
      const [type, action] = message.split('.');
      switch (type) {
        default: return process.send(`${type}.${action}`);
        case 'restart': return cluster.worker.kill();
        case 'assets': {
          return true;
        }
      }
    });
  } else {
    const sockets = require('./manager.socket');

    server
      .on('subscription.connect', socket => sockets.connect(socket))
      .on('connection', socket => sockets.connect(socket));
  }

  return server;
};
