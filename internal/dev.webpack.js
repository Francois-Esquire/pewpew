const fs = require('fs');

module.exports = function webpackWatch(callback, { paths }) {
  const webpack = {
    config: require('../webpack.config.js'),
  };

  if (typeof callback === 'function') {
    const css = [];
    const scripts = [];
    const meta = [];

    fs.stat(`${paths.public}/stats/icons.json`, (error) => {
      if (error) print.warn('Favicon stats were not found');
      else meta.push(require('../dist/public/stats/icons.json').html.join(''));
    });

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

        callback({ css, scripts, meta, hash: webpack.hash });
      }
    });
  }

  return webpack;
};
