module.exports = function generateAssets({ icons, assets, hash }) {
  const files = new Set();
  const misc = [];
  const meta = [];
  const maps = [];
  const json = [];
  const css = [];
  const scripts = [];
  const workers = [];
  const iconic = [];
  const compressed = [];

  // eslint-disable-next-line prefer-spread
  meta.push.apply(meta, icons.html);

  assets.forEach(({ name }) => {
    if (/.*\.(json|js|gz|br|css|png|ico)$/.test(name)) files.add(name);

    switch (true) {
      default: return misc.push(name);
      case name.endsWith('.ico') || name.endsWith('.png'): return iconic.push(name);
      case name.endsWith('.br') || name.endsWith('.gz'): return compressed.push(name);
      case name.endsWith('.css'): return css.push(name);
      case name.endsWith('.json'): return json.push(name);
      case name.endsWith('.map'): return maps.push(name);
      case name.endsWith('.js'): {
        if (name.startsWith('js/manifest')) return scripts.unshift(name);
        else if (name.startsWith('workers/')) return workers.push(name);
        return scripts.push(name);
      }
    }
  });

  scripts.sort((src) => {
    if (src.startsWith('js/client')) return 1;
    else if (src.startsWith('js/manifest')) return -1;
    return 0;
  });

  const paths = Array.from(files).map(src => `/${src}`);

  return JSON.stringify({
    hash,
    misc,
    meta,
    maps,
    json,
    css,
    scripts,
    workers,
    compressed,
    iconic,
    paths,
  }, undefined, 2);
};
