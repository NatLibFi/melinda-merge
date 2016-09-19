import express from 'express';
import cors from 'cors';
import { readEnvironmentVariable, corsOptions } from './utils';
import { logger } from './logger';
import _ from 'lodash';

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
  client.loadChildRecords(req.params.id, {handle_deleted: 1, include_parent: 1}).then((records) => {
    logger.log('debug', `Record ${req.params.id} with subrecords loaded`);
    const record = _.head(records);
    const subrecords = _.tail(records);
    res.send({
      record, 
      subrecords
    });
  }).catch(error => {
    logger.log('error', `Error loading record ${req.params.id}`, error);
    res.sendStatus(500);
  }).done();

});
