const path = require('path');
const _ = require('lodash');
const config = require('config');
const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const clientConfig = require('./webpack/dev.client.config.js');
const serverConfig = require('./webpack/dev.server.config.js');

const port = process.env.PORT || config.port;

const server = express();

if (config.dev) {

  console.log('webpack building...');
  const clientCompiler = webpack(clientConfig);
  const serverCompiler = webpack(serverConfig);

  const devMiddleware = webpackDevMiddleware(clientCompiler, {
    publicPath: clientConfig.output.publicPath,
    noInfo: true,
    quiet: true,
    reporter: function reporter(options) {
      console.log('client build' + options.stats.hash);
    }
  });
  const hotMiddleware = webpackHotMiddleware(clientCompiler, { log: false });

  server.use(devMiddleware);
  server.use(hotMiddleware);

  const buildFile = path.resolve(serverConfig.output.path, serverConfig.output.filename);

  const serverBuild = new Promise((resolve, reject) => {
    serverCompiler.watch({}, function onBuild(err, stats) {
      if (err) {
        throw err;
      } else {
        console.log('server build ' + stats.hash);
        delete require.cache[buildFile];
        resolve()
      }
    });
  });


  server.use(function(req, res, next) {
    serverBuild.then(() => {
      require('./build/app').default(devMiddleware.fileSystem)(req, res, next);
    });
  });
} else {
  server.use(express.static('./build/dist'));
  server.use(require('./build/app').default());
}

server.listen(port, () => {
  console.log('server is listening on port ' + port);
});