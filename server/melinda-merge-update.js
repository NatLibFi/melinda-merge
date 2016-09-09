import {executeTransaction, RollbackError} from './async-transaction';
import _ from 'lodash';
import { logger } from './logger';

export function commitMerge(client, preferredRecord, otherRecord, mergedRecord) {

  const preferredId = getRecordId(preferredRecord);
  const otherId = getRecordId(otherRecord);

  if (preferredId === undefined) {
    return Promise.reject('Could not find id from preferred record');
  } 
  if (otherId === undefined) {
    return Promise.reject('Could not find id from other record');
  }

  logger.log('info', `Removing records ${preferredId} and ${otherId}. Creating a new one.`);

  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), 4000);
  });
  //return Promise.resolve(`Removing records ${preferredId} and ${otherId}. Creating a new one.`);

  return executeTransaction([
    { 
      action: () => deleteRecordFromMelinda(preferredRecord), 
      rollback: () => undeleteRecordFromMelinda(preferredId) 
    },
    { 
      action: () => deleteRecordFromMelinda(otherRecord),     
      rollback: () => undeleteRecordFromMelinda(otherId) 
    },
    { 
      action: () => client.createRecord(mergedRecord, {bypass_low_validation: 1}),
      rollback: undefined
    }
  ]).catch(function(error) {

    if (error instanceof RollbackError) {
      logger.log('error', 'Rollback failed');
      logger.log('error', error);
    } else {
      error.message += ' (rollback was successful)';
    }
    throw error;

  });

  function undeleteRecordFromMelinda(recordId) {
    return client.loadRecord(recordId).then(function(record) {
      record.fields = record.fields.filter(field => field.tag !== 'STA');
      updateRecordLeader(record, 5, 'c');
      return client.updateRecord(record, {bypass_low_validation: 1}).then(function(res) {
        logger.log('info', 'Undelete ok', res.messages);
        return res;
      });
    }); 
  }

  function deleteRecordFromMelinda(record) {
    record.appendField(['STA', ', ', 'a', 'DELETED']);
    updateRecordLeader(record, 5, 'd');

    return client.updateRecord(record, {bypass_low_validation: 1}).then(function(res) {
      logger.log('info', 'Delete ok', res.messages);
      return res;
    });
  }

}

function getRecordId(record) {
  return _.get(record.fields.filter(f => f.tag == '001'), '[0].value');
}

function updateRecordLeader(record, index, characters) {
  record.leader = record.leader.substr(0,index) + characters + record.leader.substr(index+characters.length);
}
