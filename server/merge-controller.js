/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* UI for merging MARC records in Melinda
*
* Copyright (C) 2015-2018 University Of Helsinki (The National Library Of Finland)
*
* This file is part of melinda-merge
*
* melinda-merge program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* melinda-merge is distributed in the hope that it will be useful,
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
import {corsOptions, requireBodyParams} from 'server/utils';
import bodyParser from 'body-parser';
import {MarcRecord} from '@natlibfi/marc-record';
import cookieParser from 'cookie-parser';
import {commitMerge} from './melinda-merge-update';
import {readSessionMiddleware} from 'server/session-controller';
import _ from 'lodash';
import {createArchive} from './archive-service';
import {Utils, createApiClient} from '@natlibfi/melinda-commons';
import httpStatus from 'http-status';
import {newApiUrl} from './config';

const {createLogger, logError} = Utils;
const logger = createLogger();

logger.log('info', `merge-controller endpoint: ${newApiUrl}`);

export const mergeController = express();

mergeController.use(cookieParser())
  .use(bodyParser.json({limit: '15mb'}))
  .use(readSessionMiddleware)
  .set('etag', false)
  .options('/commit-merge', cors(corsOptions)) // enable pre-flight
  .post('/commit-merge', cors(corsOptions), requireSession, requireBodyParams('otherRecord', 'preferredRecord', 'mergedRecord', 'unmodifiedRecord'), initMerge);

function requireSession(req, res, next) {

  const username = req.session.username;
  const password = req.session.password;

  if (username && password) {
    return next();
  }
  return res.sendStatus(httpStatus.UNAUTHORIZED);
}

function initMerge(req, res) {
  const {username, password} = req.session;

  const [otherRecord, preferredRecord, mergedRecord, unmodifiedRecord] =
    [req.body.otherRecord, req.body.preferredRecord, req.body.mergedRecord, req.body.unmodifiedRecord].map(transformToMarcRecordFamily);

  const newClientConfig = {
    restApiUrl: newApiUrl,
    restApiUsername: username,
    restApiPassword: password
  };

  const newClient = createApiClient(newClientConfig);

  commitMerge(newClient, otherRecord, preferredRecord, mergedRecord)
    .then((response) => {
      logger.log('info', 'Commit merge successful', response);
      const mergedMainRecordResult = _.get(response, '[0]');

      createArchive(username, otherRecord, preferredRecord, mergedRecord, unmodifiedRecord, mergedMainRecordResult.recordId).then((res) => {
        logger.log('info', `Created archive file of the merge action: ${res.filename} (${res.size} bytes)`);
      });

      const createdRecordId = mergedMainRecordResult.recordId;
      const subrecordIdList = _.chain(response).filter(res => res.operation === 'CREATE').map('recordId').tail().value();

      newClient.getRecord(createdRecordId, {subrecords: 1}).then(({record, subrecords}) => {
        if (!record.fields || record.fields.length === 0) {
          logger.log('debug', `Record ${createdRecordId} appears to be empty record.`);
          return res.sendStatus(httpStatus.NOT_FOUND);
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
      }).catch(error => {
        logError(error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(error);
      });
    }).catch(error => {
      logError(error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send(error);
    });

  function transformToMarcRecordFamily(json) {
    return {
      record: transformToMarcRecord(json.record),
      subrecords: json.subrecords.map(transformToMarcRecord)
    };
  }

  function transformToMarcRecord(json) {
    json.fields = json.fields.filter((field) => field.tag !== '');
    return new MarcRecord(json);
  }

  function selectRecordId(record) {
    const [f001] = record.get(/^001$/);

    if (f001 === undefined) {
      throw new Error('Could not parse record id');
    } else {
      return f001.value;
    }
  }
}
