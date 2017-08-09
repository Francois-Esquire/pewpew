const fs = require('fs');
const { join } = require('path');
const { createFilter } = require('rollup-pluginutils');
const { graphql, buildSchema, introspectionQuery } = require('graphql');

function readFile(path) {
  return new Promise((resolve,reject) => {
    fs.readFile(path, (err, buffer) => {
        if (err) return reject(err);
        resolve(buffer.toString());
    });
  });
}
function writeFile(path, data, options) {
  return new Promise((resolve,reject) => {
    fs.writeFile(path, data, options, (err) => {
        if (err) return reject(err);
        resolve();
    });
  });
}

module.exports = function graphql_language (options = {}) {
  const {
    introspect,
    language,
    include,
    exclude,
  } = options;
  const schemas = [];
  const schemaPaths = [];

  const filter = createFilter(options.include, options.exclude);
  return {
    name: 'graphql-language',
    async load (id) {
      if (/\.(graphql|gql)$/.test(id) && filter(id)) {
        const schema = await readFile(id);

        if (schemaPaths.indexOf(id) < 0) {
          schemas.push(schema);
          schemaPaths.push(id);
        } else {
          schemas[schemaPaths.indexOf(id)] = schema;
        }

        // return `module.exports = \`${schema}\`;`;
        return `const schemaLanguage = \`${schema}\`;\nexport default schemaLanguage;`;
      }
      return null;
    },
    async onwrite() {
      const schema = schemas.join('\n\n');
      if (language) await writeFile(join(process.cwd(), language), schema, 'utf8');
      if (introspect) {
        const introspection = await graphql(buildSchema(schema), introspectionQuery);
        const json = JSON.stringify(introspection, undefined, 2);
        await writeFile(join(process.cwd(), introspect), json, 'utf8');
      }
    },
  };
}
