const cluster = require('cluster');
const chalk = require('chalk');

(async function startup({
  protocol,
  domains,
  host,
  port,
  paths,
  hrefs,
  keys,
  urls,
  options,
  debug,
}) {
  const { clustering } = options;

  // eslint-disable-next-line no-console
  const log = message => console.log(chalk.blue(message));
  // eslint-disable-next-line no-console
  const report = message => console.log(chalk.bold.greenBright(message));
  // eslint-disable-next-line no-console
  const warn = message => console.warn(chalk.bold.yellow(message));
  // eslint-disable-next-line no-console
  const yell = message => console.error(chalk.bold.magenta(message));

  const print = { log, report, warn, yell };

  if (cluster.isMaster) {
    log(chalk`
      {bold {hex('7659d0') Welcome} {cyan to} {green Pew} {yellow Pew}{yellow !}} (codename {hex('2bc0da') Doodad})

      {hex('2bc0da').bold NODE_ENV:} {yellow.bold ${process.env.NODE_ENV}}
      {bold PORT:} {yellow.bold ${process.env.PORT}}

      {bold Master {yellow ${process.pid}} is running}
      {bold Clustering is ${clustering.enabled ? chalk`{greenBright enabled}` : chalk`{yellow disabled}`}}
      {bold.yellow ${clustering.length}} cpus available
      {bold.yellow ${clustering.enabled ? clustering.use || clustering.length : 1}} cpus used
    `);
  }

  try {
    if (cluster.isWorker) {
      const start = debug ? './internal/dev.start' : './internal/prod.start';

      // eslint-disable-next-line import/no-dynamic-require
      await require(start)({
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
      });
    } else if (clustering.enabled) {
      const master = debug ? './internal/dev.master' : './internal/prod.master';

      // eslint-disable-next-line import/no-dynamic-require
      require(master)({
        clustering,
        paths,
        print,
      });
    } else {
      const monolith = debug ? './internal/dev.server' : './internal/prod.start';

      // eslint-disable-next-line import/no-dynamic-require
      await require(monolith)({
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
      });
    }
  } catch (error) {
    switch (error.code) {
      default: throw error;
      case 'MODULE_NOT_FOUND':
      case 'ENOENT': {
        warn(`
          /***/

          Please make sure to fire:

            "npm install && npm run build"

          to kickstart the project.

          /***/
        `);
        break;
      }
    }
  }

  // also check for mongo is running locally or able to connect.
  // check for redis as well.
  // handle mongoose errors better.

  process.on('unhandledRejection', reason => yell(chalk`
    /** Unhandled Rejection **/

    {blue Stay cool,} {green there was an unhandled promise rejection...}

    {yellow ${reason}}
    {gray ${reason.stack.replace(reason, '')}}

    /** {cyan You Got This} **/`));

  process.on('uncaughtException', error => yell(chalk`
    /** Uncaught Exception **/

    {blue Hold up,} {green there was an uncaught exception...}

    {yellow ${error.message}}

\t${(function codewhisperer() {
    switch (error.code) {
      default: return error.code;
    }
  }())}
\t{gray ${error.stack.replace(error, '')}}

    /** {cyan You Got This} **/\n`));
}(require('./config')));
