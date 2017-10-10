/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* UI for merging MARC records
*
* Copyright (C) 2015-2017 University Of Helsinki (The National Library Of Finland)
*
* This file is part of marc-merge-ui
*
* marc-merge-ui program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* oai-pmh-server-backend-module-melinda is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/

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
mergeController.use(bodyParser.json({limit: '15mb'}));
mergeController.use(readSessionMiddleware);
mergeController.set('etag', false);

mergeController.options('/commit-merge', cors(corsOptions)); // enable pre-flight

mergeController.post('/commit-merge', cors(corsOptions), requireSession, requireBodyParams('otherRecord', 'preferredRecord', 'mergedRecord', 'unmodifiedRecord'), (req, res) => {
  
  const {username, password} = req.session;

  const [otherRecord, preferredRecord, mergedRecord, unmodifiedRecord] = 
        [req.body.otherRecord, req.body.preferredRecord, req.body.mergedRecord, req.body.unmodifiedRecord].map(transformToMarcRecordFamily);

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

      createArchive(username, otherRecord, preferredRecord, mergedRecord, unmodifiedRecord, mergedMainRecordResult.recordId).then((res) => {
        logger.log('info', `Created archive file of the merge action: ${res.filename} (${res.size} bytes)`);
      });

      const createdRecordId = mergedMainRecordResult.recordId;
      const subrecordIdList = _.chain(response).filter(res => res.operation === 'CREATE').map('recordId').tail().value();

      loadRecord(client, createdRecordId).then(({record, subrecords}) => {

        if (record.fields.length === 0) {
          logger.log('debug', `Record ${createdRecordId} appears to be empty record.`);
          return res.sendStatus(404);
        }

        const subrecordsById = _.zipObject(subrecords.map(selectRecordId), subrecords);

        const subrecordsInRequestOrder = subrecordIdList.map(id => subrecordsById[id]);

        if (_.difference(subrecords, subrecordsInRequestOrder).length !== 0) {
          logger.log('info', `Warning: merge request had ${subrecords.length} subrecords while merged response had ${subrecordsInRequestOrder.length}`);
        }

        const response = _.extend({}, mergedMainRecordResult, {
          record, 
          subrecords: subrecordsInRequestOrder
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

function selectRecordId(record) {

  const field001List = record.fields.filter(field => field.tag === '001');

  if (field001List.length === 0) {
    throw new Error('Could not parse record id');
  } else {
    return field001List[0].value;
  }
}
