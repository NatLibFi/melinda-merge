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

import { readEnvironmentVariable } from 'server/utils';
import fetch from 'isomorphic-fetch';
import HttpStatus from 'http-status-codes';
import { logger } from 'server/logger';
import _ from 'lodash';

const duplicateDatabaseUrl = readEnvironmentVariable('DUPLICATE_DB_URL');

export function getDuplicateCount() {

  const url = `${duplicateDatabaseUrl}?a=count`;

  logger.debug('Loading duplicate count');
  return fetch(url).then(response => {
    if (response.status == HttpStatus.OK) {

      return response.json().then(body => {
        logger.log('debug', 'Got response', body);
        return body.message;
      });

    } else {
      throw new Error(`Error loading duplicate count: ${response.status}`);
    }
  });
}

export function getNextDuplicatePair(username) {

  const url = `${duplicateDatabaseUrl}?a=getDouble&uid=${username}`;

  logger.debug(`Loading next duplicate: ${url}`);
  return fetch(url).then(response => {
    if (response.status == HttpStatus.OK) {

      return response.json().then(body => {
        if (body.success) {

          const preferredRecordId = _.get(body, 'message.rec_id_1');
          const otherRecordId = _.get(body, 'message.rec_id_2');
          const duplicatePairId = _.get(body, 'message.id');
          const created = _.get(body, 'message.created');
          const systemMessage = _.get(body, 'message.system_message');

          return {
            preferredRecordId,
            otherRecordId,
            duplicatePairId,
            created,
            systemMessage
          };

        } else {
          throw new Error(body.message);
        }
      });

    } else {
      throw new Error(`Error loading next duplicate pair for ${username}`);
    }
  });
}

export function markPairAsNotDuplicates(username, duplicatePairId) {

  const url = `${duplicateDatabaseUrl}?a=handleDouble&id=${duplicatePairId}&action=not-double&uid=${username}`;

  logger.debug(`Marking duplicate pair ${duplicatePairId} as not duplicates: ${url}`);
  return fetch(url).then(response => {
    if (response.status == HttpStatus.OK) {

      return response.json().then(body => {
        body.success = true; // the duplicate db has bug that sends success=false on working for a=handleDouble
        if (body.success) {
          return body.message;
        } else {
          throw new Error(body.message);
        }
      });
    } else {
      logger.log('error', response);
      throw new Error(`Error marking pair as non-duplicate: ${response.status}`);
    }
  });
}

export function skipPair(username, duplicatePairId) {

  const url = `${duplicateDatabaseUrl}?a=handleDouble&id=${duplicatePairId}&action=Skip&uid=${username}`;

  logger.debug(`Skipping duplicate pair ${duplicatePairId} for ${username}: ${url}`);
  return fetch(url).then(response => {
    if (response.status == HttpStatus.OK) {

      return response.json().then(body => {
        
        body.success = true; // the duplicate db has bug that sends success=false on working for a=handleDouble
        if (body.success) {
          return body.message;
        } else {
          throw new Error(body.message);
        }
      });
    } else {
      logger.log('error', response);
      throw new Error(`Error skipping pair: ${response.status}`);
    }
  });

}

export function markDuplicatePairAsMerged(username, preferredRecordId, otherRecordId, mergedRecordId, duplicatePairId) {

  const url = `${duplicateDatabaseUrl}?a=handleDouble&id=${duplicatePairId}&action=merged&uid=${username}&source=${preferredRecordId}&target=${otherRecordId}&mergedId=${mergedRecordId}`;

  logger.debug(`Marking duplicate pair ${duplicatePairId} as merged ${username}: ${url}`);
  return fetch(url).then(response => {
    if (response.status == HttpStatus.OK) {

      return response.json().then(body => {
        body.success = true; // the duplicate db has bug that sends success=false on working for a=handleDouble
        if (body.success) {
          return body.message;
        } else {
          throw new Error(body.message);
        }
      });
    } else {
      logger.log('error', response);
      throw new Error(`Error marking pair as merged: ${response.status}`);
    }
  });
}