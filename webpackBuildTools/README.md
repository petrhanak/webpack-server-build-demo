# Webpack build middleware

simplifies using webpack builds on server with single middleware,
inspiration taken from article [Don't use nodemon by Kevin Simple](https://medium.com/@kevinsimper/dont-use-nodemon-there-are-better-ways-fc016b50b45e)


## Features
- **hot reload** - server is updated within few miliseconds
- **serving assets** - with `dev-middleware` on development and `serve-static` on production
- **less hacky** - no need for `babel-register`, `webpack-isomorphic-tools`
- **full webpack power** - files are transpilled with webpack which means you can use css modules and all fancy stuff like `import template from './layout.pug'` 
- **production ready** - after some testing it should be reliable solution

## Setup

Copy `webpackBuildTools` to root directory of your project.

### Webpack config
create second config for bundle used on server
> you can have multiple server builds (for server side rendering, api...), each with separate config

```
module.exports = [
    { /* client config */ },
    { /* server side rendering config */ },
    { /* server api endpoint config */ }
]
```

requirements for server configs

```javascript
var serverConfigs = {
    target: 'node', // to distinguish environments
    output: {
      // ...
      libraryTarget: 'commonjs', // it is necessary to export bundle as module 
    }
}
```

> it is good practise to use `target: 'web'` for client config, but can be ommitted

---

**!!! for development you have to set same output path for all configs !!!**

---

don't bundle node_modules on server, to exclude all of them use

```
externals: [ ... ],
```

> check out [`webpack-node-externals` plugin](https://github.com/liady/webpack-node-externals), it helps with listing all external modules

## Express middleware

```javascript
import webpackBuildMiddleware from 'webpack-build-middleware'
import webpackConfig from './webpack.dev.config.js'

app.use(
  webpackBuildMiddleware({
    webpackConfig: webpackConfig
  })
)
```
### Options:

**webpackConfig**: *(required)*

provide valid webpack config as exported module for environment of your choice

```
webpackConfig: require('webpack.dev.config.js')
```

---

**hot**
`default: false` 

when enabled `webpack-dev-middleware`, `webpack-hot-middleware` are included and patching require cache is setup

---

**rootDir** `default: ../`

change necessary only if you want to use different folder

### Entry module

simple route which usally returns rendered html 

```javascript
import loadAssets from '../webpackBuildMiddleware/assets'

export default function (req, res, next) {
  loadAssets(res).then(assets => {
    //here comes your logic
  });
}
```


### With `nodemon`

This is NOT replacement for restarting server. After big changes like adding loader in webpack config you want to perform full reload.

Create nodemon.json with `ignore` containing paths which will be handled with hot reload.  

```json
{
  "ignore": [
    "src/client"
  ]
}
```

### CSS modules

on server build you don't want to use `ExtractTextPlugin` - it would create another file with same content. Solution is to add `/locals` after css loader

```
{ test: /\.css$/, loader: 'css/locals?modules&importLoaders=1' },
```

## Troubleshooting
**Output file not found, run build first.**

Even we are using memory filesystem for building, `require()` always checks if file exists before performing further actions.
Without having readable file, call would fail with `Error: Cannot find module '...'`