const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  target: 'web',
  performance: {
    maxEntrypointSize: 2000000,
    maxAssetSize: 20000000,
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  devServer: {
    // other devServer configurations
    disableHostCheck: true,
  }
  
};

