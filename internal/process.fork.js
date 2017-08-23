const cluster = require('cluster');
const chalk = require('chalk');

module.exports = function fork(callback) {
  return cluster
    .fork()
    .on('online', () =>
      print.report(chalk`\tWorker process is {cyan online}`))
    .on('listening', address =>
      print.report(chalk`\tWorker process is listening on port: {cyan ${address.port}}`))
    .on('disconnect', worker =>
      print.report(chalk`\t{cyan Worker ${worker.id} disconnected.}`))
    .on('message', callback)
    .on('exit', (worker, code) => {
      print.warn(chalk`\t{magenta worker ${worker.id} died, code: ${code}.}`);
      if (code > 0) fork();
    });
};
