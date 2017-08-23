const fork = require('./process.fork');
const sockets = require('./manager.socket');

module.exports = function master() {
  let cpuCount = config.options.clustering.use || config.options.clustering.length;

  while (cpuCount !== 0) {
    fork((message, handle) => {
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
