const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const PATHS = require('./paths');

// comment out when webpack package size analyzing needed
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
//  .BundleAnalyzerPlugin;

module.exports = {
  // separates app.js and vendor files (node_modules)
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },
  resolve: {
    alias: {
      commons: path.resolve(PATHS.commons_frontend, 'js'),
      styles: path.resolve(__dirname, '../node_modules/@natlibfi/melinda-merge-ui-commons/dist/frontend/styles'),
      transformations: path.resolve(PATHS.commons_server, 'record-transformations')
    },
    // We can now require('file') instead of require('file.jsx')
    extensions: ['.js', '.jsx', '.scss']
  },
  module: {
    rules: [
      // jsx files
      {
        test: /\.jsx?$/,
        loaders: ['babel-loader'],
        include: [PATHS.app, PATHS.commons_frontend, PATHS.commons_server],
        exclude: /node_modules/
      },
      // css files
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'
        ]
      },
      // scss files
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader'
        ]
      }
    ]
  },
  plugins: [
    // removes folder and content (dist).
    new CleanWebpackPlugin(['dist']),
    // generates index.html
    new HtmlWebpackPlugin(
      {
        title: 'Merge',
        template: './frontend/index.html',
        favicon: './frontend/favicon.png',
        filename: 'index.html'
      }
    ),
    // extracts CSS into separate file(s)
    new MiniCssExtractPlugin({
      filename: 'styles.[hash].css'
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    // fi locale import instead of all (moment)
    new webpack.ContextReplacementPlugin(
      /moment[/\\]locale$/,/fi/
    )
    // visual map of webpack output files, comment out for use
    
    // new BundleAnalyzerPlugin({
    //   generateStatsFile: true
    // }),
  ]
};
