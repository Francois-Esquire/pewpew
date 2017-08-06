const fs = require('fs');

(async function startup({
  unix_socket,
  protocol,
  host,
  port,
  paths,
  endpoints,
  debug,
}) {
  const css = [];
  const scripts = [];
  const meta = [];

  try {
    if (fs.exists(`${__dirname}/dist/public/stats/icons.json`)) {
      meta.push(require('./dist/public/stats/icons.json').html.join(''));
    }

    if (debug) {
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

      sentry.on('ready', () => {
        const mongoose = require('mongoose');

        function runServer() {
          if (server && server.listening) {
            if (sockets.length) sockets.forEach(socket => socket.destroy());
            // eslint-disable-next-line no-console
            server.close(() => console.log('server updated, restarting!'));
          }

          process.nextTick(() => require('./dist/server-dev')({
            protocol,
            host,
            port,
            paths,
            endpoints,
            render: require('./dist/render.js'),
            assets: { css, scripts, meta },
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

                // eslint-disable-next-line import/no-dynamic-require
                process.nextTick(() => require(`./server/models/${name}.js`));
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

      server({
        unix_socket,
        protocol,
        host,
        port,
        paths,
        endpoints,
        render,
        assets: { css, scripts, meta, hash },
      });
    }
  } catch (error) {
    // check for mongo is running locally as well.
    if (error.code === 'MODULE_NOT_FOUND') {
      // eslint-disable-next-line no-console
      console.warn('\n/***/\nPlease make sure to fire "npm install && npm run build" to kickstart the project.\n/***/\n');
    } else throw error;
  }
}(require('./config')));
