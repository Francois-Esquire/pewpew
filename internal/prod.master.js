const cluster = require('cluster');
const chalk = require('chalk');

module.exports = function master({
  clustering,
  print,
}) {
  const sockets = [];

  function fork() {
    return cluster
      .fork()
      .on('online', () => {
        print.log('online');
      })
      .on('message', (message, handle) => {
        const [type, action] = message.split('.');
        switch (type) {
          default: break;
          case 'socket': {
            switch (action) {
              default: break;
              case 'connect': {
                sockets.push(handle);
                break;
              }
            }
          }
        }
      })
      .on('exit', (worker, code) => {
        print.warn(chalk`{magenta worker ${worker.id} died, code: ${code}.}`);
        fork();
      });
  }

  let cpuCount = clustering.use || clustering.length;
  while (cpuCount !== 0) {
    fork();
    cpuCount -= 1;
  }

  // cluster.on('online', (worker) => {
  //   console.log('Yay, the worker responded after it was forked', worker.id);
  // });
  //
};
