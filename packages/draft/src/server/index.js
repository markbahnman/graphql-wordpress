import path from 'path';
import express from 'express';
import proxy from 'http-proxy-middleware';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import fetch from 'node-fetch';
import appRouter from 'server/router/app';
import adminRouter from 'server/router/admin';
import loginRouter from 'server/router/login';
import apolloClient from 'server/router/apolloClient';
import serveResponse from 'server/router/serve';

process.env.TZ = 'America/New_York';

const clientAssets = require(KYT.ASSETS_MANIFEST); // eslint-disable-line import/no-dynamic-require
const app = express();

// Remove annoying Express header addition.
app.disable('x-powered-by');

// Compress (gzip) assets in production.
app.use(compression());

// Standard Apache combined log output.
// https://github.com/expressjs/morgan#combined
app.use(morgan('combined'));

// Setup the public directory so that we can server static assets.
app.use(express.static(path.join(process.cwd(), KYT.PUBLIC_DIR)));

app.use(cookieParser());

// use a local GQL server by default
const gqlHost = process.env.GQL_HOST || 'http://localhost:8080';

const gqlPath = process.env.GQL_PATH || '/graphql';

// proxy to the graphql server
app.use(
  gqlPath,
  proxy({
    target: gqlHost,
    changeOrigin: true,
  })
);

const getAssets = entry => (req, res, next) => {
  res.locals.assets = {
    manifestJSBundle: clientAssets['manifest.js'],
    mainJSBundle: clientAssets[`${entry}.js`],
    vendorJSBundle: clientAssets['vendor.js'],
  };
  next();
};

app.use('/oembed', async (req, res) => {
  const response = await fetch(
    `${req.query.provider}?url=${encodeURIComponent(req.query.url)}`
  ).then(result => result.json());

  res.json(response);
});

app.use('/admin', getAssets('admin'), apolloClient, adminRouter, serveResponse);
app.use('/login', getAssets('login'), apolloClient, loginRouter, serveResponse);
app.use(getAssets('main'), apolloClient, appRouter, serveResponse);

app.listen(parseInt(KYT.SERVER_PORT, 10));
