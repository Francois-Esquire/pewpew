const util = require('util');
const cluster = require('cluster');
const chalk = require('chalk');

(async function startup({
  secrets,
  protocol,
  domains,
  host,
  port,
  paths,
  hrefs,
  src,
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
  const inspect = primitive => console.log(util.inspect(primitive));
  // eslint-disable-next-line no-console
  const warn = message => console.warn(chalk.bold.yellow(message));
  // eslint-disable-next-line no-console
  const yell = message => console.error(chalk.bold.magenta(message));

  global.print = { log, report, inspect, warn, yell };

  global.config = {
    secrets,
    protocol,
    domains,
    host,
    port,
    paths,
    hrefs,
    src,
    urls,
    options,
    debug,
  };

  if (cluster.isMaster) {
    log(chalk`
    {bold {hex('7659d0') Welcome} {cyan to} {green Pew} {yellow Pew}{yellow !}} (codename {hex('2bc0da') Doodad})

    {hex('2bc0da').bold Node Version:} {yellow.bold ${process.version}}

    ---

    {bold NODE_ENV:} {yellow.bold ${process.env.NODE_ENV}}
    {bold PORT:} {yellow.bold ${process.env.PORT}}

    {bold REDIS_URL:} {green.bold ${process.env.REDIS_URL}}
    {bold MONGODB_URI:} {green.bold ${process.env.MONGODB_URI}}

    url: ${urls.host}

    {bold Master {yellow ${process.pid}} is running}
    {bold Clustering is ${clustering.enabled ? chalk`{greenBright enabled}` : chalk`{yellow disabled}`}}
    {bold.yellow ${clustering.length}} cpus available
    {bold.yellow ${clustering.enabled ? clustering.use || clustering.length : 1}} cpus used
    `);

    if (debug) {
      const watch = require('child_process').spawn('npm', ['run', 'watch']);
      watch.stderr.on('data', (data) => {
        log(chalk`\t{bold ${data}}`);
      });
      watch.on('close', (code) => {
        log(`\tchild process exited with code ${code}`);
      });
    }
  }

  if (/v8\..*/.test(process.version)) {
    const redis = require('redis');
    Object.keys(redis.RedisClient.prototype).forEach((proto) => {
      redis.RedisClient.prototype[proto] = util.promisify(redis.RedisClient.prototype[proto]);
    });
    Object.keys(redis.Multi.prototype).forEach((proto) => {
      redis.Multi.prototype[proto] = util.promisify(redis.Multi.prototype[proto]);
    });
  } else {
    warn(chalk`
    ---

    Please make sure to use Node version ^8.x.x

    (required for util.promisify)

    ---
    `);
  }

  try {
    if (cluster.isWorker) {
      const start = debug ? './internal/dev.start' : './internal/prod.start';

      // eslint-disable-next-line import/no-dynamic-require
      await require(start)();
    } else if (clustering.enabled) {
      const master = debug ? './internal/dev.master' : './internal/prod.master';

      // eslint-disable-next-line import/no-dynamic-require
      require(master)();
    } else {
      const server = debug ? './internal/dev.server' : './internal/prod.start';

      // eslint-disable-next-line import/no-dynamic-require
      await require(server)();
    }
  } catch (error) {
    switch (error.code) {
      default: throw error;
      case 'MODULE_NOT_FOUND':
      case 'ENOENT': {
        warn(`
    /** ${process.pid} **/

    ${error.message}

    Check if your loaders are failing.

    ---

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
    /** ${process.pid}:Unhandled Rejection **/

    {blue Stay cool,} {green there was an unhandled promise rejection...}

    {yellow ${reason}}
    {gray ${reason.stack.replace(reason, '')}}

    /** {cyan You Got This} **/
    `));

  process.on('uncaughtException', error => yell(chalk`
    /** ${process.pid}:Uncaught Exception **/

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
