const fs = require('fs');

module.exports = async function start({
  protocol,
  domains,
  host,
  port,
  paths,
  hrefs,
  keys,
  urls,
  print,
}) {
  const render = require('../dist/render');
  const server = require('../dist/server');
  const css = [];
  const scripts = [];
  const meta = [];

  fs.stat(`${paths.public}/stats/icons.json`, (error) => {
    if (error) print.warn('Favicon stats were not found');
    else meta.push(require('../dist/public/stats/icons.json').html.join(''));
  });

  const { assetsByChunkName, hash } = require('../dist/stats/bundle.json');

  Object.keys(assetsByChunkName)
    .forEach(chunk => assetsByChunkName[chunk].forEach((src) => {
      if (/js\//.test(src)) {
        if (src.startsWith('js/manifest')) scripts.unshift(src);
        else scripts.push(src);
      } else if (/css\//.test(src)) css.push(src);
    }));

  // eslint-disable-next-line no-confusing-arrow
  scripts.sort(src => src.startsWith('client') ? 1 : -1);

  return server({
    protocol,
    domains,
    host,
    port,
    paths,
    hrefs,
    keys,
    urls,
    render,
    assets: { css, scripts, meta, hash },
    print,
  });
};
