import fs from 'fs';

let assets;

function filterAssets(files) {
  const css = files.filter(file =>
    file.endsWith('.css')
  );
  const js = files.filter(file =>
    file.endsWith('.js') && !file.endsWith('.hot-update.js')
  );

  return {
    css,
    js
  }
}

export default function loadAssets(res) {
  if (res.locals.webpackStats) {
    //get assets from dev-middleware
    assets = new Promise((resolve, reject) => {
      let assetsByChunkName = res.locals.webpackStats.toJson().children[0].assetsByChunkName.main;

      //single chunk file is not in array
      if (typeof assetsByChunkName == 'string') {
        assetsByChunkName = [assetsByChunkName];
      }

      resolve(filterAssets(assetsByChunkName));
    })
  } else {
    if (!assets) {
      //read from dir but only once (for production usage)
      assets = new Promise((resolve, reject) => {
        fs.readdir(res.locals.clientConfig.buildDir, (err, files) => {
          if (err) {
            reject(err);
          } else {
            resolve(filterAssets(files));
          }
        });
      });
    }
  }

  return assets;
}

