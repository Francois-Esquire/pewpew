const cluster = require('cluster');

module.exports = async function start() {
  const serve = require('../dist/server');
  const emails = require('../dist/emails');
  const render = require('../dist/render');
  const assets = require('../dist/assets');

  const server = await serve({
    emails,
    render,
    assets,
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
