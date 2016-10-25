var express = require('express');
var path = require('path');
var api = require('./api/index');
var config = require('./config');
var webpackBuildMiddleware = require('../webpackBuildTools/webpackBuild').middleware;
var wire = require('../webpackBuildTools/webpackBuild').wire;

var webpackConfig = config.hot ? require('../webpack.dev.config.js') : require('../webpack.prod.config.js');

var app = express();

app.use('/api', api);

app.use(
  webpackBuildMiddleware({
    hot: config.hot,
    webpackConfig: webpackConfig
  })
);

wire('client/ssr.js');

app.listen(config.port, function(err) {
  if(err) {
    throw err;
  }

  console.log('listening on :' + config.port);
});