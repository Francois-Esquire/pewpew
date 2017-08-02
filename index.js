const fs = require('fs');

const { unix_socket, protocol, host, port, paths, debug } = require('./config');

try {
  const css = [];
  const scripts = [];
  const manifest = [];
  const meta = [];

  if (fs.exists(`${__dirname}/dist/public/stats/icons.json`)) {
    meta.push(require('./dist/public/stats/icons.json').html.join(''));
  }

  if (debug) {
    const webpack = {};
    webpack.config = require('./webpack.config.js');
    // eslint-disable-next-line no-multi-assign
    webpack.publicPath = webpack.config.output.publicPath = `http://localhost:${port}/`;
    // eslint-disable-next-line import/no-extraneous-dependencies
    webpack.compiler = require('webpack')(webpack.config);
    // eslint-disable-next-line import/no-extraneous-dependencies
    webpack.middleware = require('koa-webpack')({
      compiler: webpack.compiler,
      dev: {
        publicPath: webpack.publicPath,
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
          aggregateTimeout: 1500,
        },
      },
      hot: {
        path: '/__hmr',
        heartbeat: 1000,
      },
    });
    webpack.compiler.plugin('done', (stats) => {
      if (webpack.hash !== stats.hash) {
        const js = scripts.map(src => src.replace(`.${webpack.hash}.`, '.'));
        Object.keys(stats.compilation.assets)
          .filter(asset => !(/\.(json|css|gz|map)$/.test(asset)))
          .forEach((src) => {
            const filename = src.replace(`.${stats.hash}.`, '.');
            if (/^hot\..*/.test(filename)) return !0;
            else if (js.includes(filename)) return scripts.splice(js.indexOf(filename), 1, src);
            return src.startsWith('manifest') ? scripts.unshift(src) : scripts.push(src);
          });
        webpack.hash = stats.hash;
      }
    });

    require('./server/db')({ debug }).then((db) => {
      const sockets = [];
      let server;

      function runServer() {
        if (server && server.listening) {
          if (sockets.length) sockets.forEach(socket => socket.destroy());
          server.close();
        }

        process.nextTick(() => require('./dist/server-dev')({
          protocol,
          host,
          port,
          paths,
          render: require('./dist/render.js'),
          assets: { css, scripts, manifest, meta },
          debug,
          webpack,
          db,
        }).then((p) => {
          // eslint-disable-next-line no-console
          console.log('server restarted!');
          p.server.on('connection', (socket) => {
            const socketId = sockets.length;
            sockets[socketId] = socket;
            socket.on('close', () => sockets.splice(socketId, 1));
          });
          server = p.server;
        }));
      }

      // eslint-disable-next-line import/no-extraneous-dependencies
      const chokidar = require('chokidar');
      const sentry = chokidar.watch(['./dist/*.js', './server/models/*.js']);
      sentry.on('ready', () => {
        const mongoose = require('mongoose');

        sentry.on('all', (event, src) => {
          switch (event) {
            default: break;
            case 'change': {
              if (/server\/models\/.*\.js/.test(src)) {
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
              if (src === 'dist/render.js') delete require.cache[`${__dirname}/dist/render.js`];
              delete require.cache[`${__dirname}/dist/server-dev.js`];
              runServer();
              break;
            }
          }
        });

        return runServer();
      });
    });
  } else {
    const render = require('./dist/render');
    const server = require('./dist/server');
    const assets = require('./dist/stats/bundle.json').assetsByChunkName;

    Object.keys(assets)
      .forEach(chunk => assets[chunk].forEach((src) => {
        if (/js\//.test(src)) {
          if (src.startsWith('js/manifest')) scripts.unshift(src);
          else scripts.push(src);
        } else if (/css\//.test(src)) css.push(src);
      }));

    server({
      unix_socket,
      protocol,
      host,
      port,
      paths,
      render,
      assets: { css, scripts, manifest, meta },
    });
  }
} catch (error) {
  // check for mongo is running locally as well.
  if (error.code === 'MODULE_NOT_FOUND') {
    // eslint-disable-next-line no-console
    console.warn('\n/***/\nPlease make sure to fire "npm install && npm run build" to kickstart the project.\n/***/\n');
  } else throw error;
}
