const path = require('path');
const webpack = require('webpack');

// BEWARE TO ALL FROM THE FUTURE:
// Webpack is REQUIRED for this project to work.
// Do not delete the config, files, or dependencies.
const config = {
  context: __dirname,
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, './www'),
    filename: 'index.js'
  },
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
  devtool: 'source-map'
}

module.exports = config;