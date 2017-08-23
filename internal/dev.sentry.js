const chalk = require('chalk');

module.exports = function watchFiles(watchMe, options, callback) {
  if (typeof callback === 'function') {
    const files = new Set();
    // eslint-disable-next-line import/no-extraneous-dependencies
    const sentry = require('chokidar').watch(watchMe, options);

    sentry
      .on('add', path => files.add(path))
      .on('unlink', path => files.delete(path))
      .on('ready', () => callback(sentry, files, events =>
        sentry.on('all', (event, src) => {
          print.report(chalk`\t{whiteBright file ${event} with ${src}}`);
          return typeof events === 'function' && events(event, src, files);
        })));
  }
};
