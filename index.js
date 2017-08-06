const fs = require('fs');

(async function startup({
  protocol,
  domains,
  host,
  port,
  paths,
  hrefs,
  keys,
  urls,
  debug,
}) {
  const css = [];
  const scripts = [];
  const meta = [];

  try {
    fs.stat(`${__dirname}/dist/public/stats/icons.json`, (error) => {
      if (error) throw error;
      else meta.push(require('./dist/public/stats/icons.json').html.join(''));
    });

    if (debug) {
      require('redis').debug_mode = true;

      let server;
      const sockets = [];

      const webpack = {
        config: require('./webpack.config.js'),
      };

      // eslint-disable-next-line import/no-extraneous-dependencies
      webpack.middleware = require('koa-webpack')(Object.assign(webpack, {
        // eslint-disable-next-line import/no-extraneous-dependencies
        compiler: require('webpack')(webpack.config),
        dev: {
          publicPath: webpack.config.output.publicPath,
          serverSideRender: true,
          compress: true,
          lazy: false,
          hot: true,
          overlay: true,
          quiet: false,
          stats: {
            errors: true,
            colors: true,
          },
          watchOptions: {
            aggregateTimeout: 1200,
          },
        },
        hot: {
          path: '/__hmr',
          heartbeat: 1000,
        },
      }));

      webpack.compiler.plugin('done', (stats) => {
        if (webpack.hash !== stats.hash) {
          const js = scripts.map(src => src.replace(`.${webpack.hash}.`, '.'));

          Object.keys(stats.compilation.assets)
            .forEach((src) => {
              if (src.endsWith('.js')) {
                const filename = src.replace(`.${stats.hash}.`, '.');
                if (!/^hot\..*/.test(filename)) {
                  if (js.includes(filename)) scripts.splice(js.indexOf(filename), 1, src);
                  else if (src.startsWith('manifest')) scripts.unshift(src);
                  else scripts.push(src);
                }
              }
            });

          // eslint-disable-next-line no-confusing-arrow
          scripts.sort(src => src.startsWith('client') ? 1 : -1);

          webpack.hash = stats.hash;
        }
      });

      const db = await require('./server/db')({ debug });

      // eslint-disable-next-line import/no-extraneous-dependencies
      const sentry = require('chokidar')
        .watch(['./dist/*.js', './server/models/*.js']);

      sentry.on('ready', async () => {
        const mongoose = require('mongoose');

        const redis = require('redis')
          .createClient(urls.redis)
          // eslint-disable-next-line no-use-before-define
          .on('connect', runServer);

        function runServer() {
          if (server && server.listening) {
            if (sockets.length) sockets.forEach(socket => socket.destroy());
            // eslint-disable-next-line no-console
            server.close(() => console.log('server updated, restarting!'));
          }

          process.nextTick(() => require('./dist/server-dev')({
            protocol,
            domains,
            host,
            port,
            paths,
            hrefs,
            keys,
            redis,
            render: require('./dist/render.js'),
            assets: { css, scripts, meta, hash: webpack.hash },
            debug,
            webpack,
            db,
          }).then((p) => {
            server = p.server.on('connection', (socket) => {
              const socketId = sockets.length;
              sockets[socketId] = socket;
              socket.on('close', () => sockets.splice(socketId, 1));
            });
          }));
        }

        sentry.on('all', (event, src) => {
          switch (event) {
            default: break;
            case 'change': {
              if (src === 'dist/render.js') delete require.cache[`${__dirname}/dist/render.js`];
              else if (/server\/models\/.*\.js/.test(src)) {
                delete require.cache[`${__dirname}/${src}`];

                const name = src.replace('server/models/', '').replace('.js', '');
                const [a, ...b] = name;
                const modelName = `${a.toUpperCase()}${b.join('').replace(/s$/, '')}`;

                delete mongoose.models[modelName];
                delete mongoose.connection.collections[name];
                delete mongoose.modelSchemas[modelName];

                process.nextTick(require, `./server/models/${name}.js`);
              }

              delete require.cache[`${__dirname}/dist/server-dev.js`];

              runServer();
              break;
            }
          }
        });

        return runServer();
      });
    } else {
      const os = require('os');
      const cluster = require('cluster');
      const redis = require('redis').createClient(urls.redis);
      const render = require('./dist/render');
      const server = require('./dist/server');
      const { assetsByChunkName, hash } = require('./dist/stats/bundle.json');

      Object.keys(assetsByChunkName)
        .forEach(chunk => assetsByChunkName[chunk].forEach((src) => {
          if (/js\//.test(src)) {
            if (src.startsWith('js/manifest')) scripts.unshift(src);
            else scripts.push(src);
          } else if (/css\//.test(src)) css.push(src);
        }));

      // eslint-disable-next-line no-confusing-arrow
      scripts.sort(src => src.startsWith('client') ? 1 : -1);

      if (cluster.isMaster) {
        let count = Math.floor(os.cpus().length / 2);

        while (count !== 0) {
          cluster
            .fork()
            .on('exit', (worker, code) => {
              console.log(`worker ${worker.process.pid} died, code: ${code}.`);
            });
          count -= 1;
        }
        // console.log(`Master ${process.pid} is running`);
      } else {
        server({
          protocol,
          domains,
          host,
          port,
          paths,
          hrefs,
          keys,
          redis,
          render,
          assets: { css, scripts, meta, hash },
        });
      }
    }
  } catch (error) {
    switch (error.code) {
      default: throw error;
      case 'MODULE_NOT_FOUND':
      case 'ENOENT': {
        // eslint-disable-next-line no-console
        console.warn('\n/***/\nPlease make sure to fire "npm install && npm run build" to kickstart the project.\n/***/\n');
        break;
      }
      // also check for mongo is running locally or able to connect.
      // check for redis as well.
    }
  }

  process.on('unhandledRejection', (reason, promise) => {
    // eslint-disable-next-line no-console
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  });
}(require('./config')));
