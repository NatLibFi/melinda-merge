const path = require('path');

module.exports = {
  app: path.resolve(__dirname, '../frontend/js'),
  commons_frontend: path.resolve(__dirname, '../node_modules/@natlibfi/melinda-ui-commons/dist/frontend'),
  commons_styles: path.resolve(__dirname, '../node_modules/@natlibfi/melinda-ui-commons/dist/frontend/styles'),
  commons_server: path.resolve(__dirname, '../node_modules/@natlibfi/melinda-ui-commons/dist/server'),
  commons_images: path.resolve(__dirname, '../node_modules/@natlibfi/melinda-ui-commons/dist/frontend/images'),
  images: path.resolve(__dirname, '../frontend/images')
};