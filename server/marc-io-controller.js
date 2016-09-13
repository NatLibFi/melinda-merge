import express from 'express';
import cors from 'cors';
import { readEnvironmentVariable, corsOptions, requireBodyParams } from './utils';
import { logger } from './logger';
import bodyParser from 'body-parser';
import MarcRecord from 'marc-record-js';
import cookieParser from 'cookie-parser';
import HttpStatus from 'http-status-codes';
import { commitMerge } from './melinda-merge-update';
import { readSessionMiddleware } from './session-controller';
import _ from 'lodash';

const MelindaClient = require('melinda-api-client');
const alephUrl = readEnvironmentVariable('ALEPH_URL');

const defaultConfig = {
  endpoint: `${alephUrl}/API`,
  user: '',
  password: ''
};

export const marcIOController = express();

marcIOController.use(cookieParser());
marcIOController.use(bodyParser.json());
marcIOController.use(readSessionMiddleware);
marcIOController.set('etag', false);

marcIOController.options('/commit-merge', cors(corsOptions)); // enable pre-flight


marcIOController.get('/:id', cors(corsOptions), (req, res) => {

  const client = new MelindaClient(defaultConfig);

  logger.log('debug', `Loading record ${req.params.id}`);
  client.loadRecord(req.params.id, {handle_deleted: 1}).then((record) => {
    logger.log('debug', `Record ${req.params.id} loaded`);
    res.send(record);
  }).catch(error => {
    logger.log('error', `Error loading record ${req.params.id}`, error);
    res.sendStatus(500);
  }).done();

});

marcIOController.post('/commit-merge', cors(corsOptions), requireSession, requireBodyParams('otherRecord', 'preferredRecord','mergedRecord'), (req, res) => {
  
  const {username, password} = req.session;

  const [otherRecord, preferredRecord, mergedRecord] = 
        [req.body.otherRecord, req.body.preferredRecord, req.body.mergedRecord].map(transformToMarcRecord);

  const clientConfig = { 
    ...defaultConfig,
    user: username,
    password: password
  };

  const client = new MelindaClient(clientConfig);

  commitMerge(client, otherRecord, preferredRecord, mergedRecord)
    .then((response) => {
      logger.log('info', 'Commit merge successful', response);
      res.send(response);
    }).catch(error => {
      logger.log('error', 'Commit merge error', error);
      res.sendStatus(500);
    });

});

function requireSession(req, res, next) {

  const username = _.get(req, 'session.username');
  const password = _.get(req, 'session.password');

  if (username && password) {
    return next();
  } else {
    res.sendStatus(HttpStatus.UNAUTHORIZED);    
  }

}

function transformToMarcRecord(json) {
  return new MarcRecord(json);
}
