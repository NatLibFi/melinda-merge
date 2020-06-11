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

import {executeTransaction, RollbackError} from './async-transaction';
import _ from 'lodash';
import {Utils} from '@natlibfi/melinda-commons';
import {v4 as uuid} from 'uuid';
import {logError} from '@natlibfi/melinda-commons/dist/utils';

const {createLogger} = Utils;
const logger = createLogger();
const FUTURE_HOST_ID_PLACEHOLDER = '(FI-MELINDA)[future-host-id]';

export function commitMerge(client, preferredRecord, otherRecord, mergedRecord) {
  const jobId = uuid().slice(0, 8);

  const preferredId = getFamilyId(preferredRecord);
  const otherId = getFamilyId(otherRecord);

  const idValidation = validateIds({preferred: preferredId, other: otherId});
  if (idValidation.error) {
    return Promise.reject(idValidation.error);
  }

  logger.log('info', `${jobId}] Commit merge job ${jobId} started.`);
  logger.log('info', `${jobId}] Removing records ${preferredId.record} [${preferredId.subrecords.join()}], ${otherId.record} [${otherId.subrecords.join()}] and creating new ones.`);

  return createRecord(mergedRecord.record).then(res => {
    const newParentRecordId = res.recordId;
    logger.log('debug', `New parent record id: ${newParentRecordId}`);
    const mergedRecordRollbackAction = () => deleteRecordById(newParentRecordId);

    mergedRecord.subrecords = mergedRecord.subrecords.map(setParentRecordId(newParentRecordId));

    const mergedSubrecordActions = mergedRecord.subrecords.map(rec => {
      return {
        action: () => createRecord(rec),
        rollback: (res) => deleteRecordById(res.recordId)
      };
    });

    const otherMainRecordAction = {
      action: () => deleteRecordFromMelinda(otherRecord.record),
      rollback: () => undeleteRecordFromMelinda(otherId.record)
    };

    const otherSubrecordActions = _.zip(otherRecord.subrecords, otherId.subrecords).map(([rec, id]) => {
      return {
        action: () => deleteRecordFromMelinda(rec),
        rollback: () => undeleteRecordFromMelinda(id)
      };
    });


    const preferredMainRecordAction = {
      action: () => deleteRecordFromMelinda(preferredRecord.record),
      rollback: () => undeleteRecordFromMelinda(preferredId.record)
    };

    const preferredSubrecordActions = _.zip(preferredRecord.subrecords, preferredId.subrecords).map(([rec, id]) => {
      return {
        action: () => deleteRecordFromMelinda(rec),
        rollback: () => undeleteRecordFromMelinda(id)
      };
    });

    return executeTransaction(_.concat(
      mergedSubrecordActions,
      otherSubrecordActions,
      otherMainRecordAction,
      preferredSubrecordActions,
      preferredMainRecordAction
    ), [mergedRecordRollbackAction]).then(function (results) {
      logger.log('info', `${jobId}] Commit merge job ${jobId} completed.`);
      logger.log('debug', `Setting ${JSON.stringify(res)} as first result`);
      return [res, ...results];
    }).catch(function (error) {
      if (error instanceof RollbackError) {
        logger.log('error', `${jobId}] Rollback failed`);
        logger.log('error', `${jobId}], ${error}`);
        logger.log('error', `${jobId}] Commit merge job ${jobId} failed.`);
        logger.log('info', `${jobId}] Rollback failed`);
        logger.log('info', `${jobId}], ${error}`);
        logger.log('info', `${jobId}] Commit merge job ${jobId} failed.`);
      } else {
        error.message += ' (rollback was successful)';
        logger.log('info', `${jobId}] Rollback was successful`);
        logger.log('info', `${jobId}] Error in transaction`, error);
        logger.log('info', `${jobId}] Commit merge job ${jobId} failed.`);
      }
      throw error;
    });
  }).catch(error => {
    error.message += ' (rollback was successful)';
    logger.log('info', `${jobId}] Rollback was successful`);
    throw error;
  });

  function createRecord(record) {
    logger.log('info', `${jobId}] Creating new record`);
    return client.postPrio({params: {noop: 0, unique: 0}, body: JSON.stringify(record)}).then(res => {
      const {recordId} = res;
      logger.log('info', `${jobId}] Create record ok for ${recordId}`);
      return _.assign({}, res, {operation: 'CREATE'});
    }).catch(err => {
      logger.log('info', `${jobId}] Failed to create record  ${err.status} - ${err.message}`);
      throw err;
    });
  }

  function undeleteRecordFromMelinda(recordId) {
    logger.log('info', `${jobId}] Undeleting ${recordId}`);
    return client.getRecord(recordId).then(({record}) => {
      logger.log('silly', `Record from api-client: ${JSON.stringify(record)}`);
      record.get(/^STA$/u).forEach(field => record.removeField(field));
      updateRecordLeader(record, 5, 'c');
      return client.postPrio({params: {noop: 0}, body: JSON.stringify(record)}, recordId).then(res => {
        logger.log('info', `${jobId}] Undelete ok for ${recordId}`, res.messages);
        return _.assign({}, res, {operation: 'UNDELETE'});
      });
    }).catch(err => {
      logger.log('info', `${jobId}] Failed to undelete record ${err.status} - ${err.message}`);
      logError(err);
      throw err;
    });
  }

  function deleteRecordFromMelinda(record) {
    const recordId = getRecordId(record);
    logger.log('info', `${jobId}] Deleting ${recordId}`);

    record.appendField(['STA', '', '', 'a', 'DELETED']);
    updateRecordLeader(record, 5, 'd');

    return client.postPrio({params: {noop: 0}, body: JSON.stringify(record)}, recordId).then(res => {
      logger.log('info', `${jobId}] Delete ok for ${recordId}`, res.messages);
      return _.assign({}, res, {operation: 'DELETE'});
    }).catch(err => {
      logger.log('info', `${jobId}] Failed to delete record ${err.status} - ${err.message}`);
      throw err;
    });
  }

  function deleteRecordById(recordId) {
    logger.log('info', `${jobId}] Deleting ${recordId}`);
    return client.getRecord(recordId).then(({record}) => {
      logger.log('silly', `Record from api-client: ${JSON.stringify(record)}`);
      record.appendField(['STA', '', '', 'a', 'DELETED']);
      updateRecordLeader(record, 5, 'd');
      return client.postPrio({params: {noop: 0}, body: JSON.stringify(record)}, recordId).then(res => {
        logger.log('info', `${jobId}] Delete ok for ${recordId}`, res.messages);
        return _.assign({}, res, {operation: 'DELETE'});
      });
    }).catch(err => {
      logger.log('info', `${jobId}] Failed to delete record  ${err.status} - ${err.message}`);
      throw err;
    });
  }
}

function setParentRecordId(id) {
  return (subrecord) => {
    logger.log('debug', `Setting parent id ${id} to subrecord`);
    const f773s = subrecord.get(/^773$/u);
    const updatedF773s = f773s.map(field => {
      field.subfields = field.subfields.map(sub => {
        if (sub.code === 'w' && sub.value === FUTURE_HOST_ID_PLACEHOLDER) {
          return _.assign({}, sub, {value: `(FI-MELINDA)${id}`});
        }
        return sub;
      });
      return field;
    });
    f773s.forEach(field => subrecord.removeField(field));
    updatedF773s.forEach(field => subrecord.appendField(field));
    return subrecord;
  };
}

function validateIds({preferred, other}) {
  if (!isValidId(preferred.record)) {
    return notValid('Id not found for preferred record.');
  }
  if (!isValidId(other.record)) {
    return notValid('Id not found for other record.');
  }

  const invalidPreferredSubrecordIndex = _.findIndex(preferred.subrecords, (id) => !isValidId(id));
  if (invalidPreferredSubrecordIndex !== -1) {
    return notValid(`Id not found for ${invalidPreferredSubrecordIndex + 1}. subrecord from preferred record.`);
  }
  const invalidOtherSubrecordIndex = _.findIndex(other.subrecords, (id) => !isValidId(id));
  if (invalidOtherSubrecordIndex !== -1) {
    return notValid(`Id not found for ${invalidOtherSubrecordIndex + 1}. subrecord from other record.`);
  }

  return {
    ok: true
  };

  function notValid(message) {
    return {
      error: new Error(message)
    };
  }
}

function isValidId(id) {
  return id !== undefined && !isNaN(id) && id !== '';
}

function getFamilyId(family) {
  return {
    record: getRecordId(family.record),
    subrecords: family.subrecords.map(getRecordId)
  };
}

function getRecordId(record) {
  const [f001] = record.get(/^001$/);
  if (f001 === undefined) {
    return '';
  }
  return f001.value;
}

function updateRecordLeader(record, index, characters) {
  record.leader = record.leader.substr(0, index) + characters + record.leader.substr(index + characters.length);
}
