const Koa = require('koa');
const KoaSubdomain = require('koa-subdomain');
const KoaRouter = require('koa-router');
const KoaCors = require('kcors');
const KoaHelmet = require('koa-helmet');
const KoaSession = require('koa-session');
const KoaBody = require('koa-bodyparser');
const KoaSend = require('koa-send');
const KoaMulter = require('koa-multer');
const KoaFavicon = require('koa-favicon');
const KoaUserAgent = require('koa-useragent');
const { graphqlKoa, graphiqlKoa } = require('graphql-server-koa');
const GridStorage = require('multer-gridfs-storage');
const μs = require('microseconds');

module.exports = function appPrimer({
  routes,
  middleware,
  context,
  schema,
  assets,
}) {
  const app = new Koa();
  const router = new KoaRouter();

  app.keys = config.secrets.get('keys');
  app.subdomainOffset = config.host.split('.').length;

  Object.assign(app.context, context);

  const gql = graphqlKoa(async ctx => ({
    schema,
    rootValue: await ctx.helpers.getRootValue(ctx),
    context: ctx,
    debug: config.debug,
  }));

  const giql = graphiqlKoa({
    endpointURL: config.hrefs.graphql,
    subscriptionsEndpoint: config.hrefs.graphqlSub,
  });

  routes.push({
    path: '/graphql',
    verbs: ['post'],
    use: gql,
  }, {
    path: '/graphiql',
    verbs: ['get'],
    use: giql,
  });

  const api = new KoaSubdomain().use(
    config.domains.graphql,
    new KoaRouter()
      .get(`/${config.domains.graphiql}`, giql)
      .post('*', gql)
      .routes());

  const content = new KoaSubdomain().use(
    config.domains.content,
    new KoaRouter().get(/^(.*)\.(.*){3,4}$/, async (ctx) => {
      try {
        const id = ctx.params[0];
        const ext = ctx.params[1];
        const file = await ctx.db.gfs.findOne({ id, filename: `${id}.${ext}` });

        if (!file) {
          ctx.status = 204;
          ctx.body = 'file could not be found.';
        }

        const { _id, contentType, filename } = file;

        ctx.set('Content-Type', contentType);
        ctx.set('Content-Disposition', `attachment; filename="${filename}"`);
        ctx.body = ctx.db.gfs.createReadStream({ _id });

        ctx.body.on('error', (err) => {
          print.log('Got error while processing stream ', err.message);
          ctx.res.end();
        });
      } catch (e) { /**/ }
    }).routes());

  const uploads = new KoaSubdomain().use(
    config.domains.upload,
    new KoaRouter().post('/*', KoaMulter({
      storage: new GridStorage({
        gfs: context.db.gfs,
        metadata: (req, file, cb) => {
          cb(null, file);
        },
        root: (req, file, cb) => cb(null, null),
      }),
      fileFilter(req, file, cb) { cb(null, true); },
      limits: {
        files: 1,
      },
      preservePath: true,
    }).single('file')).use(async (ctx) => {
      ctx.res.statusCode = 200;
    }).routes());

  routes.forEach(route =>
    route.verbs.forEach(verb => router[verb](route.path, route.use)));

  middleware.forEach(ware => app.use(ware));

  app
    .use(async (ctx, next) => {
      try {
        await next();
      } catch (e) {
        ctx.status = 500;
        ctx.body = `There was an error. Please try again later.\n\n${e.message}`;
      }
    })
    .use(async (ctx, next) => {
      const start = μs.now();
      await next();
      const end = μs.parse(μs.since(start));
      const total = end.microseconds + (end.milliseconds * 1e3) + (end.seconds * 1e6);
      ctx.set('Response-Time', `${total / 1e3}ms`);
    })
    .use(KoaCors({
      allowMethods: ['GET'],
      credentials: true,
      keepHeadersOnError: true,
    }))
    .use(KoaHelmet())
    .use(KoaFavicon(config.paths.favicon))
    .use(KoaSession({
      key: 'persona',
      maxAge: 86400000,
      overwrite: true,
      httpOnly: true,
      signed: true,
      rolling: false,
    }, app))
    .use(KoaUserAgent)
    .use(async (ctx, next) => {
      if (/\.(ico|png|svg|css|js|json)$/.test(ctx.path)) {
        if (assets.paths.indexOf(ctx.path) >= 0) print.log(`\tmatching path: ${ctx.path}`);
        // ctx.set('Etag', ctx.assets.hash);
        ctx.set('Service-Worker-Allowed', '/');
        if (ctx.path === '/favicon.ico') {
          if (ctx.status === 404) ctx.status = 204;
        } else {
          try {
            const root = /^\/(images)\//.test(ctx.path) ?
              config.paths.assets : config.paths.public;
            const immutable = !config.debug;
            await KoaSend(ctx, ctx.path, { root, immutable });
          } catch (e) { /**/ }
        }
      } else await next();
    })
    .use(async (ctx, next) => {
      if (typeof ctx.session.visits === 'number') ctx.session.visits += 1;
      else ctx.session.visits = 0;
      ctx.state.access =
        ctx.session.access ||
        ctx.headers.authorization;
      // print.log(`access token: ${ctx.state.access}`);
      // print.inspect(ctx.userAgent);
      // print.inspect(ctx.session);
      await next();
    })
    .use(KoaBody())
    .use(api.routes())
    .use(content.routes())
    .use(uploads.routes())
    .use(router.routes())
    .use(router.allowedMethods());

  return app;
};
