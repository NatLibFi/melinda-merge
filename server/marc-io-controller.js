import express from 'express';
import cors from 'cors';
import { readEnvironmentVariable } from './utils';
import { logger } from './logger';

const MelindaClient = require('melinda-api-client');
const apiUrl = readEnvironmentVariable('MELINDA_API');

const config = {
  endpoint: apiUrl,
  user: '',
  password: ''
};

const whitelist = ['http://localhost:3000', 'http://localhost:3001', undefined];
const corsOptions = {
  origin: function(origin, callback) {
    var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
    callback(originIsWhitelisted ? null : 'Bad Request', originIsWhitelisted);
  }
};

export const marcIOController = express();

marcIOController.set('etag', false);

marcIOController.get('/:id', cors(corsOptions), (req, res) => {

  const client = new MelindaClient(config);

  logger.log('debug', `Loading record ${req.params.id}`);
  client.loadRecord(req.params.id, {handle_deleted: 1}).then((record) => {
    logger.log('debug', `Record ${req.params.id} loaded`);
    res.send(record);
  }).done();

});
