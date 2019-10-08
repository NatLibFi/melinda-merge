const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.config.common');
const PATHS = require('./paths');

module.exports = merge(common, {
  // development or production config
  mode: 'development',
  // env : process.env.NODE_ENV,
  entry: {
    'main': [
      'babel-polyfill',
      'react-hot-loader/patch',
      path.resolve(PATHS.app, 'main.js')
    ],
  },
  // webpack output location after the processing (dist-folder)
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name]-bundle.js',
    publicPath: '/'
  },
  // webpack server config in development
  devServer: {
    contentBase: path.resolve(__dirname, '../frontend'), // webpack serves files from frontend folder (index.html)
    port: 3000,
    historyApiFallback: true,
    overlay: true // displays webpack error messages also in browser window
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },
  stats: {
    colors: true,
    reasons: true
  },
  module: {
    rules: [
      // images
      {
        test: /\.(jpg|gif|png)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'images/[name]-[hash:8].[ext]',
              outputPath: 'images/'
            }
          }
        ]
      },
      // font-face imports (fonts)
      {
        test: /\.(woff|woff2|eot|ttf|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/'
            }
          }
        ]
      },
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.§.NODE_ENV': JSON.stringify('development'),
      'process.env.DATA_PROTECTION_CONSENT_URL': JSON.stringify('https://www.kiwi.fi/download/attachments/93205241/melinda-verkkok%C3%A4ytt%C3%B6liittym%C3%A4t%20asiantuntijoille.pdf?api=v2'),
      __DEV__: JSON.stringify(JSON.parse(process.env.DEBUG || 'false'))
    })
  ],
  devtool: 'source-map'
});
