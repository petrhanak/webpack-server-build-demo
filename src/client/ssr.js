import React from 'react';
import ReactDOM from 'react-dom/server';
import App from './components/App';
import layout from './views/layout.pug';
import loadAssets from '../../webpackBuildTools/assets';

export default function(req, res, next) {
  loadAssets(res).then(assets => {
    const app = ReactDOM.renderToString(<App />);

    res.send(
      layout({
        app,
        css: assets.css,
        js: assets.js,
        publicPath: res.locals.clientConfig.publicPath
      })
    );
  });
};
