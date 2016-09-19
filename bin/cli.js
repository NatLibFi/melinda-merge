/* eslint no-console:0 */
import { readEnvironmentVariable } from '../server/utils';
import MelindaClient from 'melinda-api-client';
import _ from 'lodash';
import { stdin } from 'process';
import MarcRecord from 'marc-record-js';

const alephUrl = readEnvironmentVariable('ALEPH_URL');
const username = readEnvironmentVariable('ALEPH_USER');
const password = readEnvironmentVariable('ALEPH_PASS');

const clientConfig = {
  endpoint: `${alephUrl}/API`,
  user: username,
  password: password
};

const argv = require('yargs').argv;

if (!isNaN(parseInt(argv._[0])) && argv._.length < 2) {
  argv._.unshift('get');
}

const client = new MelindaClient(clientConfig);

const [command, recordId] = argv._;

if (command === 'get') {

  client.loadRecord(recordId).then(record => {
    console.log(record.toString());
  }).catch(error => {
    console.error(error);
  });
}


if (command === 'create') {

  readRecordFromStdin()
    .then(record => client.createRecord(record))
    .then(printResponse)
    .catch(printError);

}

if (command === 'update') {

  readRecordFromStdin()
    .then(record => client.updateRecord(record))
    .then(printResponse)
    .catch(printError);

}

if (command === 'set') {

  readRecordFromStdin()
    .then(record => {
      const updateRecordChangeMetadata = _.curry(setRecordChangeMetadata)(record);

      const recordId = getRecordId(record);
      return client.loadRecord(recordId, {handle_deleted: 1})
        .then(getRecordChangeMetadata)
        .then(updateRecordChangeMetadata);

    })
    .then(record => client.updateRecord(record))
    .then(printResponse)
    .catch(printError);

}

function getRecordId(record) {
  const f001 = _.head(record.getControlfields().filter(f => f.tag === '001'));
  return f001.value;
}

function getRecordChangeMetadata(record) {
  const f005 = _.head(record.getControlfields().filter(f => f.tag === '005'));
  const fCAT = record.getDatafields().filter(f => f.tag === 'CAT');
  return [f005.value, fCAT];
}

function setRecordChangeMetadata(record, [timestamp, CATFields]) {
  const f005 = _.head(record.getControlfields().filter(f => f.tag === '005'));
  f005.value = timestamp;
  record.fields = record.fields.filter(f => f.tag !== 'CAT').concat(CATFields);
  return record;
}

function readRecordFromStdin() {
  return new Promise((resolve, reject) => {

    let inputChunks = '';
    stdin.resume();
    stdin.setEncoding('utf8');

    stdin.on('data', function (chunk) {
      inputChunks += chunk;
    });

    stdin.on('end', function () {
      try {
        
        const filteredInputChinks = inputChunks.split('\n').filter(_.identity).join('\n');
        const record = MarcRecord.fromString(filteredInputChinks);
        resolve(record);
      } catch(e) {
        reject(e);
      }
    });
  });
}

function printResponse(response) {
  console.log(response);

  console.log('Messages:');
  response.messages.forEach(msg => console.log(` ${msg.code} ${msg.message}`));
  
  console.log('Errors:');
  response.errors.forEach(msg => console.log(` ${msg.code} ${msg.message}`));
  
  console.log('Triggers:');
  response.triggers.forEach(msg => console.log(` ${msg.code} ${msg.message}`));
  
  console.log('Warnings:');
  response.warnings.forEach(msg => console.log(` ${msg.code} ${msg.message}`));
  
}

function printError(error) {
  console.log(error);
  
  console.log('Errors:');
  _.get(error, 'errors', []).forEach(msg => console.log(` ${msg.code} ${msg.message}`));
  
  console.log('Triggers:');
  _.get(error, 'triggers', []).forEach(msg => console.log(` ${msg.code} ${msg.message}`));
  
  console.log('Warnings:');
  _.get(error, 'warnings', []).forEach(msg => console.log(` ${msg.code} ${msg.message}`));
  
}