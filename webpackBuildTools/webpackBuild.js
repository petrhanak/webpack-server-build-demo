var express = require('express');
var path = require('path');
var webpack = require('webpack');
var fs = require('fs');

var app = express();

var config;
var parsedConfigs;
var clientConfig;
var serverConfigs;
var webpackFileSystem;

var defaultConfig = {
  hot: false,
  webpackConfig: null,
  rootDir: path.resolve(__dirname, '..')
};

// todo add support for multiple entries
function getFile(configNode, onlyDir) {
  if (typeof configNode === 'string') {
    return configNode
  } else {
    if (onlyDir) {
      return path.resolve(configNode.path);
    } else {
      return path.resolve(configNode.path, configNode.filename)
    }
  }
}

function processConfig(config) {
  if (config.target === 'node' && !config.output.libraryTarget.startsWith('commonjs')) {
    throw "You must set libraryTarget: 'commonjs' in webpack output config"
  }

  return {
    target: config.target || 'web',
    inputFile: getFile(config.entry),
    outputFile: getFile(config.output),
    buildDir: getFile(config.output, true),
    publicPath: config.output.publicPath
  };
}

function parseConfig(webpackConfig) {
  if (Array.isArray(webpackConfig)) {
    return webpackConfig.map(function (config) {
      return processConfig(config)
    });
  } else if (typeof webpackConfig === 'object') {
    return [processConfig(webpackConfig)]
  } else {
    throw 'Provided webpack config is invalid'
  }
}

function patch(devMiddleware) {
  webpackFileSystem = devMiddleware.fileSystem;

  serverConfigs.forEach(function (config) {
    var moduleBuffer = webpackFileSystem.readFileSync(config.outputFile);

    var m = new module.constructor();
    m._compile(moduleBuffer.toString(), config.outputFile);

    require.cache[config.outputFile] = m;
  });
}

function parseConfigs(config) {
  if (!config.webpackConfig) {
    throw 'Required option webpackConfig was not provided into middleware'
  }

  parsedConfigs = parseConfig(config.webpackConfig);
  clientConfigs = parsedConfigs.filter(function (config) {
    return config.target === 'web';
  });

  if (clientConfigs.length === 0) {
    throw 'Webpack config has no client bundle set up'
  } else {
    clientConfig = clientConfigs[0]
  }

  serverConfigs = parsedConfigs.filter(function (config) {
    return config.target === 'node';
  });

  if (serverConfigs.length === 0) {
    throw 'Webpack config has no server bundle set up'
  }
}

function webpackBuildMiddlware(cfg) {
  config = Object.assign({}, defaultConfig, cfg);
  parseConfigs(config);

  if (config.hot) {
    var compiler = webpack(config.webpackConfig);

    var devMiddleware = require('webpack-dev-middleware')(compiler, {
      publicPath: clientConfig.publicPath,
      serverSideRender: true,
      reporter: function () {
        patch(devMiddleware);
      }
    });
    var hotMiddleware = require('webpack-hot-middleware')(compiler);

    app.use(devMiddleware);
    app.use(hotMiddleware);
  } else {
    //serve static assets on production
    app.use(clientConfig.publicPath, express.static(clientConfig.buildDir));
  }

  app.use(function (req, res, next) {
    res.locals.clientConfig = clientConfig;
    next();
  });

  return app;
}

function wire(filename) {

  var matchingServerConfigs = serverConfigs.filter(function (serverConfig) {
    return serverConfig.inputFile.endsWith(filename)
  });

  if (matchingServerConfigs.length === 0) {
    throw "Config with entry '" + filename + "' not found."
  }

  if (matchingServerConfigs.length > 1) {
    throw "Multiple configs matching entry '" + filename + "' were found. Make entry filename more specific."
  }

  serverConfig = matchingServerConfigs[0];

  fs.access(serverConfig.outputFile, fs.F_OK, function(err){
    if (err) {
      throw 'Output file not found, run build first.'
    }
  });

  if (config.hot) {
    app.use(function (req, res, next) {
        require(serverConfig.outputFile).default(req, res, next);
      next();
    });
  } else {
    app.use(require(serverConfig.outputFile).default);
  }

}

module.exports.middleware = webpackBuildMiddlware;
module.exports.wire = wire;