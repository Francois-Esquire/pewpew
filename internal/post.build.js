const fs = require('fs');

const pkg = require('../package.json');
const config = require('../config');

const {
  assets,
  hash,
} = require('../dist/stats/bundle.json');

const icons = require('../dist/icons/icons.json');

const manifestTemp = require('../dist/icons/manifest.json');

const manifest = JSON.stringify(Object.assign(manifestTemp, {
  name: pkg.title,
  short_name: pkg.title,
  description: pkg.description,
  start_url: '.',
}), undefined, 2);

const manifestPath = config.src.manifest;
const assetPath = config.src.assets;

fs.stat(manifestPath, (error) => {
  if (error) fs.appendFileSync(manifestPath, manifest);
  else fs.writeFileSync(manifestPath, manifest);
});

assets.push({ name: 'manifest.json' });

const glue = require('./generate.assets')({ icons, assets, hash });

fs.stat(assetPath, (error) => {
  if (error) fs.appendFileSync(assetPath, glue);
  else fs.writeFileSync(assetPath, glue);
});
