import express from 'express';
import cors from 'cors';
import { readEnvironmentVariable, corsOptions, requireBodyParams } from 'server/utils';
import { logger } from 'server/logger';
import bodyParser from 'body-parser';
import MarcRecord from 'marc-record-js';
import cookieParser from 'cookie-parser';
import HttpStatus from 'http-status-codes';
import { commitMerge } from './melinda-merge-update';
import { readSessionMiddleware } from 'server/session-controller';
import _ from 'lodash';
import { createArchive } from './archive-service';

const MelindaClient = require('melinda-api-client');
const alephUrl = readEnvironmentVariable('ALEPH_URL');
const apiVersion = readEnvironmentVariable('MELINDA_API_VERSION', null);
const apiPath = apiVersion !== null ? `/${apiVersion}` : '';

const defaultConfig = {
  endpoint: `${alephUrl}/API${apiPath}`,
  user: '',
  password: ''
};

logger.log('info', `merge-controller endpoint: ${defaultConfig.endpoint}`);

export const mergeController = express();

mergeController.use(cookieParser());
mergeController.use(bodyParser.json({limit: '5mb'}));
mergeController.use(readSessionMiddleware);
mergeController.set('etag', false);

mergeController.options('/commit-merge', cors(corsOptions)); // enable pre-flight

mergeController.post('/commit-merge', cors(corsOptions), requireSession, requireBodyParams('otherRecord', 'preferredRecord', 'mergedRecord'), (req, res) => {
  
  const {username, password} = req.session;

  const [otherRecord, preferredRecord, mergedRecord] = 
        [req.body.otherRecord, req.body.preferredRecord, req.body.mergedRecord].map(transformToMarcRecordFamily);

  const clientConfig = { 
    ...defaultConfig,
    user: username,
    password: password
  };

  const client = new MelindaClient(clientConfig);

  commitMerge(client, otherRecord, preferredRecord, mergedRecord)
    .then((response) => {
      logger.log('info', 'Commit merge successful', response);
      const mergedMainRecordResult = _.get(response, '[0]');

      createArchive(username, otherRecord, preferredRecord, mergedRecord, mergedMainRecordResult.recordId).then((res) => {
        logger.log('info', `Created archive file of the merge action: ${res.filename} (${res.size} bytes)`);
      });

      const createdRecordId = mergedMainRecordResult.recordId;
      loadRecord(client, createdRecordId).then(({record, subrecords}) => {

        if (record.fields.length === 0) {
          logger.log('debug', `Record ${createdRecordId} appears to be empty record.`);
          return res.sendStatus(404);
        }

        // TODO: reorder subrecords into same order with mergedRecord.subrecords

        const response = _.extend({}, mergedMainRecordResult, {
          record, 
          subrecords
        });

        res.send(response);
      });

      
    }).catch(error => {
      logger.log('error', 'Commit merge error', error);
      res.status(500).send(error);
    });

});

function loadRecord(client, id) {
  return new Promise((resolve, reject) => {

    client.loadChildRecords(id, {handle_deleted: 1, include_parent: 1}).then((records) => {
      logger.log('debug', `Record ${id} with subrecords loaded`);
      const record = _.head(records);
      const subrecords = _.tail(records);

      return resolve({record, subrecords});

    }).catch(reject).done();
  });
}

function requireSession(req, res, next) {

  const username = _.get(req, 'session.username');
  const password = _.get(req, 'session.password');

  if (username && password) {
    return next();
  } else {
    res.sendStatus(HttpStatus.UNAUTHORIZED);    
  }

}

function transformToMarcRecordFamily(json) {
  return {
    record: transformToMarcRecord(json.record),
    subrecords: json.subrecords.map(transformToMarcRecord)
  };
}

function transformToMarcRecord(json) {
  return new MarcRecord(json);
}
