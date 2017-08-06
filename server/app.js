const Koa = require('koa');
const KoaSubdomain = require('koa-subdomain');
const KoaRouter = require('koa-router');
const KoaHelmet = require('koa-helmet');
const KoaSession = require('koa-session');
const KoaBody = require('koa-bodyparser');
const KoaSend = require('koa-send');
const KoaMulter = require('koa-multer');
const KoaFavicon = require('koa-favicon');
const GridStorage = require('multer-gridfs-storage');
const ms = require('microseconds');

module.exports = function App({
  gql: { graphql, graphiql },
  keys,
  routes,
  middleware,
  context,
  domains,
  debug,
}) {
  const app = new Koa();
  const router = new KoaRouter();

  app.keys = keys;
  app.subdomainOffset = 1;

  Object.assign(app.context, context);

  const api = new KoaSubdomain().use(
    domains.graphql,
    new KoaRouter()
      .get(`/${domains.graphiql}`, graphiql)
      .post('*', graphql)
      .routes());

  const content = new KoaSubdomain().use(
    domains.content,
    new KoaRouter().get(/^(.*)\.(.*){3,4}$/, async (ctx) => {
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
        console.log('Got error while processing stream ', err.message);
        ctx.res.end();
      });
    }).routes());

  const uploads = new KoaSubdomain().use(
    domains.upload,
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
    }).single('file'), async (ctx) => {
      ctx.res.statusCode = 200;
    }).routes());

  if (routes) {
    routes.forEach(route =>
      route.verbs.forEach(verb => router[verb](route.path, route.use)));
  }

  if (middleware) middleware.forEach(ware => app.use(ware));

  app
    .use(KoaHelmet())
    .use(async (ctx, next) => {
      try {
        await next();
      } catch (e) {
        ctx.status = 500;
        ctx.body = `There was an error. Please try again later.\n\n${e.message}`;
      }
    })
    .use(async (ctx, next) => {
      const start = ms.now();
      await next();
      const end = ms.parse(ms.since(start));
      const total = end.microseconds + (end.milliseconds * 1e3) + (end.seconds * 1e6);
      ctx.set('Response-Time', `${total / 1e3}ms`);
    })
    .use(KoaFavicon(`${process.cwd()}/dist/public/icons/favicon.ico`))
    .use(async (ctx, next) => {
      try {
        if (ctx.path !== '/') {
          // if (/\.(svg|css|js)$/.test(ctx.path)) ctx.set({ Etag: ctx.assets.hash });

          const root = `${process.cwd()}${
            /^\/(images)\//.test(ctx.path) ? '/assets' : '/dist/public'
          }`;
          const immutable = !debug;
          await KoaSend(ctx, ctx.path, { root, immutable });
        }
      } catch (e) { /* Errors will fall through */ }
      await next();
    })
    .use(KoaSession({
      key: 'persona',
      maxAge: 86400000,
      overwrite: true,
      httpOnly: true,
      signed: true,
      rolling: false,
    }, app), async (ctx, next) => {
      ctx.session.parcel = 'parcel';
      ctx.state.token =
        ctx.cookies.get('token') ||
        ctx.headers.authorization;
      return next();
    })
    .use(KoaBody())
    .use(api.routes())
    .use(content.routes())
    .use(uploads.routes())
    .use(router.routes())
    .use(router.allowedMethods());

  return app;
};
