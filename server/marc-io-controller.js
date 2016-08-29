import express from 'express';
import { readEnvironmentVariable } from './utils';
import { logger } from './logger';

const MelindaClient = require('melinda-api-client');
const apiUrl = readEnvironmentVariable('MELINDA_API');

const config = {
  endpoint: apiUrl,
  user: '',
  password: ''
};

export const marcIOController = express();

marcIOController.set('etag', false);

marcIOController.get('/:id', (req, res) => {

  const client = new MelindaClient(config);

  logger.log('debug', `Loading record ${req.params.id}`);
  client.loadRecord(req.params.id).then((record) => {
    logger.log('debug', `Record ${req.params.id} loaded`);
    res.send(record);
  }).done();

});
