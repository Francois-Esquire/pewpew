const cleanup = require('rollup-plugin-cleanup');
const resolve = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-replace');
const buble = require('rollup-plugin-buble');
const gql = require('rollup-plugin-graphql');

const pkg = require('../package.json');

const externals = new Set(Object.keys(pkg.dependencies).concat('react-dom/server'));

module.exports = {
  entry: 'src/components/Application.jsx',
  targets: [
    // { dest: 'src/appl.js', format: 'cjs' },
    { dest: 'src/appl.es', format: 'es' }],
  sourceMap: false,
  external: id =>
    (/\.(css|png|jpg|jpeg|gif|svg|eot|ttf|woff|woff2)$/.test(id) || externals.has(id)),
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
    resolve({
      jsnext: true,
      main: false,
      browser: true,
      extensions: ['.js', '.jsx', '.gql'],
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
