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
import {readSessionMiddleware, requireSession} from 'server/session-controller';
import _ from 'lodash';
import {createArchive} from './archive-service';
import {Utils, createApiClient} from '@natlibfi/melinda-commons';
import httpStatus from 'http-status';
import {restApiUrl, restApiUsername, restApiPassword} from './config';

const {createLogger, logError} = Utils;
const logger = createLogger();

logger.log('info', `merge-controller endpoint: ${restApiUrl}`);

export const mergeController = express();

mergeController.use(cookieParser());
mergeController.use(bodyParser.json({limit: '15mb'}));
mergeController.use(readSessionMiddleware);
mergeController.set('etag', false);
mergeController.options('/commit-merge', cors(corsOptions)); // enable pre-flight
mergeController.post('/commit-merge', cors(corsOptions), requireSession, requireBodyParams('otherRecord', 'preferredRecord', 'mergedRecord', 'unmodifiedRecord'), initMerge);

function initMerge(req, res) {
  const {username} = req.session;

  const [otherRecord, preferredRecord, mergedRecord, unmodifiedRecord] =
    [req.body.otherRecord, req.body.preferredRecord, req.body.mergedRecord, req.body.unmodifiedRecord].map(transformToMarcRecordFamily);

  const newClientConfig = {
    restApiUrl,
    restApiUsername,
    restApiPassword,
    cataloger: username
  };

  const newClient = createApiClient(newClientConfig);

  commitMerge(newClient, otherRecord, preferredRecord, mergedRecord)
    .then((response) => {
      logger.log('info', `Commit merge successful: ${JSON.stringify(response)}`);
      const mergedMainRecordResult = _.get(response, '[0]');

      createArchive(username, otherRecord, preferredRecord, mergedRecord, unmodifiedRecord, mergedMainRecordResult.recordId).then((res) => {
        logger.log('info', `Created archive file of the merge action: ${res.filename} (${res.size} bytes)`);
      });

      const createdRecordId = mergedMainRecordResult.recordId;
      const subrecordIdList = _.chain(response).filter(res => res.operation === 'CREATE').map('recordId').tail().value();

      logger.log('debug', `Loading record: ${createdRecordId}, and subrecords: ${subrecordIdList}`);

      newClient.getRecord(createdRecordId, {subrecords: 1}).then(({record, subrecords}) => {
        if (record === undefined) {
          logger.log('debug', `Record ${createdRecordId} appears to be empty record.`);
          return res.sendStatus(httpStatus.NOT_FOUND);
        }
        logger.log('verbose', 'Got new record and subrecords');
        logger.log('silly', `Record: ${JSON.stringify(record)}`);
        logger.log('silly', `Subecords: ${JSON.stringify(subrecords)}`);
        // Returns Object where subrecords are placed in object by id
        const subrecordsById = _.zipObject(subrecords.map(selectRecordId), subrecords);
        logger.log('silly', `Subecords by ID: ${JSON.stringify(subrecordsById)}`);
        // Subecords by ID: {<id>: Marcrecord}

        // Returns array of ids and value is null if subrecordList does not have anyting in variable id
        const subrecordsInRequestOrder = subrecordIdList.map(id => {
          logger.log('silly', `Id: ${id}`);
          logger.log('silly', `In slot: ${subrecordsById[id + '']}`);
          return subrecordsById[`${id}`];
        });
        logger.log('silly', `Subecords in request Order: ${JSON.stringify(subrecordsInRequestOrder)}`);

        if (_.difference(subrecords, subrecordsInRequestOrder).length !== 0) {
          logger.log('info', `Warning: merge request had ${subrecords.length} subrecords while merged response had ${subrecordsInRequestOrder.length}`);
        }

        const response = _.extend({}, mergedMainRecordResult, {
          record,
          subrecords: subrecordsInRequestOrder
        });

        logger.log('verbose', 'Sending response to merge/commit-merge');
        logger.log('silly', `Response: ${JSON.stringify(response)}`);
        // Response: {recordId, operation, record: MarcRecord,"subrecords":[MarcRecord or null]}
        return res.status(httpStatus.OK).send(response);
      }).catch(error => {
        logError(error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).send(error);
      });
    }).catch(error => {
      logError(error);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send(error);
    });

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
    const f001s = record.get(/^001$/u);

    if (f001s.length === 0) {
      throw new Error('Could not parse record id');
    }
    const [f001] = f001s;
    return f001.value;
  }
}
