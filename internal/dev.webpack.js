module.exports = function webpackWatch(callback) {
  const assets = require('../dist/assets');
  const webpack = {
    config: require('../webpack.config'),
  };

  // eslint-disable-next-line no-multi-assign
  const css = assets.css = [];
  // eslint-disable-next-line no-multi-assign
  const scripts = assets.scripts = [];

  // eslint-disable-next-line import/no-extraneous-dependencies
  webpack.middleware = require('koa-webpack')(Object.assign(webpack, {
    // eslint-disable-next-line import/no-extraneous-dependencies
    compiler: require('webpack')(webpack.config),
    hot: {
      path: '/__hmr',
      heartbeat: 1000,
    },
    dev: {
      hot: true,
      lazy: false,
      serverSideRender: true,
      publicPath: webpack.config.output.publicPath,
      watchOptions: {
        aggregateTimeout: 1200,
      },
      headers: {
        'Service-Worker-Allowed': '/',
      },
      noinfo: false,
      quiet: false,
      stats: {
        colors: true,
      },
      // reporter: ({ state, stats, options: { noinfo, quiet } }) => {
      //   if (state && quiet === false) {
      //     const {
      //       warnings,
      //       errors,
      //     } = stats.compilation;
      //
      //     warnings.forEach(warn => print.warn(warn));
      //     errors.forEach(warn => print.yell(warn));
      //
      //     if (noinfo === false) {
      //       print.log(JSON.stringify(Object.keys(stats.compilation)));
      //     }
      //   }
      // },
    },
  }));

  function getAssets(stats) {
    const js = scripts.map(src => src.replace(`.${webpack.hash}.`, '.'));

    Object.keys(stats.compilation.assets)
      .filter(src => src.endsWith('.js'))
      .filter(src => !src.startsWith('hot'))
      .filter(src => !src.startsWith('worker'))
      .sort((src) => {
        if (src.startsWith('manifest')) return -1;
        else if (src.startsWith('client')) return 1;
        return 0;
      })
      .forEach((src) => {
        const filename = src.replace(`.${stats.hash}.`, '.');
        if (js.includes(filename)) scripts.splice(js.indexOf(filename), 1, src);
        else if (src.startsWith('manifest')) scripts.unshift(src);
        else scripts.push(src);
      });

    return Object.assign(assets, { css, scripts, hash: stats.hash });
  }

  webpack.close = webpack.middleware.dev.close;
  webpack.invalidate = webpack.middleware.dev.invalidate;
  webpack.waitUntilValid = webpack.middleware.dev.waitUntilValid;
  webpack.fs = webpack.middleware.dev.fileSystem;
  webpack.publish = webpack.middleware.hot.publish;
  webpack.hmr = webpack.hot.path;
  webpack.getAssets = getAssets;
  webpack.initialized = false;

  webpack.compiler.plugin('done', (stats) => {
    if (webpack.hash !== stats.hash) {
      webpack.assets = getAssets(stats);
      webpack.hash = stats.hash;
      webpack.stats = stats;

      if (callback) callback(webpack.assets);
    }
  });

  return new Promise((resolve) => {
    webpack.waitUntilValid(() => {
      if (!webpack.initialized) {
        webpack.initialized = true;
        config.hrefs.hmr = config.src.client[0];
        config.hrefs.hmr_url = webpack.hmr;
        print.report('webpack initialized');
        resolve(webpack);
      }
    });
  });
};
