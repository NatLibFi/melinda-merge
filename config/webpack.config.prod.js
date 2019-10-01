const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const merge = require('webpack-merge');
const common = require('./webpack.config.common');
const PATHS = require('./paths');

module.exports = merge(common, {
  mode: 'production',
  entry: {
    'js/app': path.resolve(PATHS.app, 'main.js')
  },
  output: {
    path: path.resolve(__dirname, '../dist/public'),
    filename: '[name]-bundle.js',
    publicPath: '/'
  },
  module: {
    rules: [
      // Inline base64 URLs for <=8k images, direct URLs for the rest
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        use: [
          {
            loader: 'url-loader?limit=8192',
            options: {
              name: 'images/[name]-[hash:8].[ext]',
              outputPath: 'images/'
            }
          }
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf)$/,
        loader: 'url-loader?limit=8192&name=fonts/[name].[ext]?[hash]'
      }
    ]
  },
  plugins: [
    new OptimizeCssAssetsPlugin({
      filename: '[name]-[contenthash].css',
      cssProcessorOptions: {
        preset: 'advanced'
      }
    }),
    new CopyWebpackPlugin([
      {
        from: PATHS.commons_images,
        to: 'images'
      }
    ]),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.DATA_PROTECTION_CONSENT_URL': JSON.stringify('https://www.kiwi.fi/download/attachments/93205241/melinda-verkkok%C3%A4ytt%C3%B6liittym%C3%A4t%20asiantuntijoille.pdf?api=v2'),
      __DEV__: JSON.stringify(JSON.parse(process.env.DEBUG || 'false'))
    })
  ],
  devtool: 'source-map'
});
