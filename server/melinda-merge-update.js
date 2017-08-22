import {executeTransaction, RollbackError} from './async-transaction';
import _ from 'lodash';
import { logger } from 'server/logger';
import uuid from 'uuid';

const FUTURE_HOST_ID_PLACEHOLDER = '(FI-MELINDA)[future-host-id]';


export function commitMerge(client, preferredRecord, otherRecord, mergedRecord) {

  const jobId = uuid.v4().slice(0,8);

  const preferredId = getFamilyId(preferredRecord);
  const otherId = getFamilyId(otherRecord);

  const idValidation = validateIds({ preferred: preferredId, other: otherId });
  if (idValidation.error) {
    return Promise.reject(idValidation.error);
  }

  logger.log('info', `${jobId}] Commit merge job ${jobId} started.`);
  logger.log('info', `${jobId}] Removing records ${preferredId.record} [${preferredId.subrecords.join()}], ${otherId.record} [${otherId.subrecords.join()}] and creating new ones.`);

  return createRecord(mergedRecord.record).then(res => {
    const newParentRecordId = res.recordId;

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
    ), [mergedRecordRollbackAction]).then(function(results) {
      results.unshift(res);
      logger.log('info', `${jobId}] Commit merge job ${jobId} completed.`);
      return results;
    }).catch(function(error) {

      if (error instanceof RollbackError) {
        logger.log('error', `${jobId}] Rollback failed`);
        logger.log('error', jobId, error);
        logger.log('error', `${jobId}] Commit merge job ${jobId} failed.`);
        logger.log('info', `${jobId}] Rollback failed`);
        logger.log('info', jobId, error);
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
    return client.createRecord(record, {bypass_low_validation: 1, bypass_index_check: 1}).then(res => {
      logger.log('info', `${jobId}] Create record ok for ${res.recordId}`, res.messages);
      return _.assign({}, res, {operation: 'CREATE'});
    }).catch(err => {
      logger.log('info', `${jobId}] Failed to create record`, err);
      throw err;
    });
  }

  function undeleteRecordFromMelinda(recordId) {
    logger.log('info', `${jobId}] Undeleting ${recordId}`);
    return client.loadRecord(recordId, {handle_deleted:1, no_rerouting: 1}).then(function(record) {
      record.fields = record.fields.filter(field => field.tag !== 'STA');
      updateRecordLeader(record, 5, 'c');
      return client.updateRecord(record, {bypass_low_validation: 1, handle_deleted: 1, no_rerouting: 1, bypass_index_check: 1}).then(function(res) {
        logger.log('info', `${jobId}] Undelete ok for ${recordId}`, res.messages);
        return _.assign({}, res, {operation: 'UNDELETE'});
      });
    }).catch(err => {
      logger.log('info', `${jobId}] Failed to undelete record`, err);
      throw err;
    });
  }

  function deleteRecordFromMelinda(record) {
    const recordId = getRecordId(record);
    logger.log('info', `${jobId}] Deleting ${recordId}`);
    
    record.appendField(['STA', '', '', 'a', 'DELETED']);
    updateRecordLeader(record, 5, 'd');

    return client.updateRecord(record, {bypass_low_validation: 1, handle_deleted: 1, no_rerouting: 1, bypass_index_check: 1}).then(function(res) {
      logger.log('info', `${jobId}] Delete ok for ${recordId}`, res.messages);
      return _.assign({}, res, {operation: 'DELETE'});
    }).catch(err => {
      logger.log('info', `${jobId}] Failed to delete record`, err);
      throw err;
    });
  }

  function deleteRecordById(recordId) {
    logger.log('info', `${jobId}] Deleting ${recordId}`);
    return client.loadRecord(recordId, {handle_deleted: 1, no_rerouting: 1}).then(function(record) {
      record.appendField(['STA', '', '', 'a', 'DELETED']);
      updateRecordLeader(record, 5, 'd');
      return client.updateRecord(record, {bypass_low_validation: 1, handle_deleted: 1, no_rerouting: 1, bypass_index_check: 1}).then(function(res) {
        logger.log('info', `${jobId}] Delete ok for ${recordId}`, res.messages);
        return _.assign({}, res, {operation: 'DELETE'});
      });
    }).catch(err => {
      logger.log('info', `${jobId}] Failed to delete record`, err);
      throw err;
    });
  }

}

function setParentRecordId(id) {
  return function(subrecord) {

    subrecord.fields = subrecord.fields.map(field => {
      if (field.tag === '773') {
        field.subfields = field.subfields.map(sub => {
          if (sub.code === 'w' && sub.value === FUTURE_HOST_ID_PLACEHOLDER) {
            return _.assign({}, sub, {value: `(FI-MELINDA)${id}`});
          }
          return sub;
        });
      }
      return field;
    });

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
    return notValid(`Id not found for ${invalidPreferredSubrecordIndex+1}. subrecord from preferred record.`); 
  }
  const invalidOtherSubrecordIndex = _.findIndex(other.subrecords, (id) => !isValidId(id));
  if (invalidOtherSubrecordIndex !== -1) {
    return notValid(`Id not found for ${invalidOtherSubrecordIndex+1}. subrecord from other record.`); 
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
  return id !== undefined && !isNaN(id);
}

function getFamilyId(family) {
  return {
    record: getRecordId(family.record),
    subrecords: family.subrecords.map(getRecordId)
  };
}

function getRecordId(record) {
  return _.get(record.fields.filter(f => f.tag == '001'), '[0].value');
}

function updateRecordLeader(record, index, characters) {
  record.leader = record.leader.substr(0,index) + characters + record.leader.substr(index+characters.length);
}
