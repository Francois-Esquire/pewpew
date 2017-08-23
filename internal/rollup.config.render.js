const cleanup = require('rollup-plugin-cleanup');
const resolve = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-replace');
const alias = require('rollup-plugin-path-alias');
const buble = require('rollup-plugin-buble');
const gql = require('rollup-plugin-graphql');

const pkg = require('../package.json');
const config = require('../config');

const externals = new Set(Object.keys(pkg.dependencies).concat('react-dom/server'));
const extensions = ['.js', '.jsx', '.gql'];

module.exports = {
  entry: 'src/render/render.js',
  dest: 'dist/render.js',
  format: 'cjs',
  sourceMap: false,
  external: id =>
    (/\.(css|png|jpg|jpeg|gif|svg|eot|ttf|woff|woff2)$/.test(id) || (externals.has(id))),
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
    alias({
      paths: config.paths,
      extensions,
    }),
    resolve({
      jsnext: true,
      main: false,
      browser: false,
      extensions,
    }),
    gql(),
    buble({
      transforms: {
        generator: false,
        letConst: false,
        arrow: true,
        classes: true,
        modules: false,
        templateString: false,
        spreadRest: true,
        destructuring: true,
        parameterDestructuring: true,
        defaultParameter: true,
        collections: false,
        computedProperty: false,
        conciseMethodProperty: true,
        reservedProperties: false,
        numericLiteral: false,
        constLoop: false,
        forOf: false,
        dangerousForOf: true,
        dangerousTaggedTemplateString: true,
        stickyRegExp: true,
        unicodeRegExp: true,
      },
      jsx: 'React.createElement',
      objectAssign: 'Object.assign',
      namedFunctionExpressions: false,
    }),
    cleanup({
      maxEmptyLines: 0,
      comments: ['eslint'],
    })],
};
