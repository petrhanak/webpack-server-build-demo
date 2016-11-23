const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: 'node_modules',
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                "react",
                ["latest", {
                  "es2015": {
                    "modules": false
                  }
                }],
                "stage-0"
              ]
            }
          }
        ]
      },
      {
        test: /\.pug$/,
        exclude: 'node_modules',
        loader: 'pug-loader'
      },
      {
        test: /\.css$/,
        exclude: 'node_modules',
        loader: 'css-loader/locals?modules'
      }
    ]
  },
  target: 'node',
  entry: [
    path.resolve(__dirname, '..', 'src', 'index.js'),
  ],
  output: {
    path: path.resolve(__dirname, '..', 'build'),
    filename: 'app.js',
    libraryTarget: 'commonjs2'
  },
  externals: [nodeExternals()],
  node: {
    __filename: true,
    __dirname: true
  }
};