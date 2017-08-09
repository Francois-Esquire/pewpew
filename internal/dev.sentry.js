const chalk = require('chalk');

module.exports = function watchFiles(callback, watchMe, { print, options }) {
  if (typeof callback === 'function') {
    const files = [];
    // eslint-disable-next-line import/no-extraneous-dependencies
    const sentry = require('chokidar')
      .watch(watchMe, options);

    sentry.on('add', path => files.push(path));
    sentry.on('ready', () => callback(sentry, files, events =>
      sentry.on('all', (event, src) => {
        print.report(chalk`\t{whiteBright file ${event} with ${src}}`);
        return events(event, src);
      })));
  }
};
