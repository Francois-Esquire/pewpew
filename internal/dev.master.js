const cluster = require('cluster');

const fork = require('./process.fork');
const sockets = require('./manager.socket');

module.exports = async function master() {
  require('redis').debug_mode = config.debug;

  await require('./dev.webpack')(({ css, scripts, meta, hash }) => {
    const assets = { css, scripts, meta, hash };
    Object.keys(cluster.workers).forEach(id => cluster.workers[id].send('assets', assets));
  });

  require('./dev.sentry')([
    './dist/*.js',
    './server/models/*.js'], {
    print,
    options: {},
  }, (sentry, files, cb) => cb((event) => {
    switch (event) {
      default: break;
      case 'change': {
        Object.keys(cluster.workers).forEach(id => cluster.workers[id].send('restart'));
        break;
      }
    }
  }));

  let cpuCount = config.options.clustering.use || config.options.clustering.length;

  while (cpuCount !== 0) {
    fork({ print }, (message, handle) => {
      const [type, action] = message.split('.');
      switch (type) {
        default: break;
        case 'socket': {
          switch (action) {
            default: break;
            case 'connect': {
              sockets.connect(handle);
              break;
            }
          }
        }
      }
    });
    cpuCount -= 1;
  }
};
