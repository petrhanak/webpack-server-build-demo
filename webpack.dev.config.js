var path = require('path');
var webpack = require('webpack');
var nodeExternals = require('webpack-node-externals');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var _ = require('lodash');

var client = {
  module: {
    loaders: [
      { test: /\.css$/, loader: ExtractTextPlugin.extract('css-loader?modules&importLoaders=1&localIdentName=[local]___[hash:base64:8]') },
      { test: /\.pug$/, loader: 'pug' },
      { test: /\.js$/, loader: 'babel' }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new ExtractTextPlugin("style.css"),
  ],
  entry: path.resolve(__dirname, 'src', 'client', 'browser.js'),
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'app-[hash].js',
    publicPath: '/static/'
  }
};

var server = {
  module: {
    loaders: [
      { test: /\.css$/, loader: 'css/locals?modules&importLoaders=1&localIdentName=[local]___[hash:base64:8]' },
      { test: /\.pug$/, loader: 'pug' },
      { test: /\.js$/, loader: 'babel' }
    ]
  },
  entry: path.resolve(__dirname, 'src', 'client', 'ssr.js'),
  target: 'node',
  devtool: 'source-map',
  output: {
    filename: 'ssr.js',
    path: path.resolve(__dirname, 'build'),
    libraryTarget: 'commonjs',
  },
  // externals: [nodeExternals()]
};


module.exports = [
  client,
  server
];