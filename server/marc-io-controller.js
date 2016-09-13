import express from 'express';
import cors from 'cors';
import { readEnvironmentVariable, corsOptions } from './utils';
import { logger } from './logger';

const MelindaClient = require('melinda-api-client');
const alephUrl = readEnvironmentVariable('ALEPH_URL');

const config = {
  endpoint: `${alephUrl}/API`,
  user: '',
  password: ''
};

export const marcIOController = express();

marcIOController.set('etag', false);

marcIOController.get('/:id', cors(corsOptions), (req, res) => {

  const client = new MelindaClient(config);

  logger.log('debug', `Loading record ${req.params.id}`);
  client.loadRecord(req.params.id, {handle_deleted: 1}).then((record) => {
    logger.log('debug', `Record ${req.params.id} loaded`);
    res.send(record);
  }).catch(error => {
    logger.log('error', `Error loading record ${req.params.id}`, error);
    res.sendStatus(500);
  }).done();

});
