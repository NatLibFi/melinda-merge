import { match } from '../frontend/js/component-record-match-service';
import _ from 'lodash';
import MarcRecord from 'marc-record-js';
import uuid from 'node-uuid';
import fetch from 'isomorphic-fetch';
import path from 'path';
import fs from 'fs';
import columnify from 'columnify';

const APIBasePath = 'https://merge-test.melinda.kansalliskirjasto.fi/api';

const filesPath = path.resolve(__dirname, '..', '..', 'component-record-match-files');

const cols = process.stdout.columns;
const maxWidth = Math.floor((cols-6)/2);

const columnifyOptions = {
  columns: ['a', 'b'],
  preserveNewLines: true,
  config: {
    a: {
      maxWidth: maxWidth
    },
    b: {
      maxWidth: maxWidth
    }
  }
};

const {a, b} = readPairFromFile(1);

a.subrecords.push(_.cloneDeep(a.subrecords[0]));
b.subrecords.push(_.cloneDeep(b.subrecords[1]));


randomSort(b.subrecords);

const matchResult = match(a.subrecords, b.subrecords);

const data = matchResult
  .map(compactView)
  .map(result => ({a: result[0].toString(), b: result[1].toString()}))
  .reduce((rows, item) => { 
    rows.push(item);
    rows.push({});
    return rows;
  }, []);

const report = columnify(data, columnifyOptions);

console.log(report);

function randomSort(arr) {
  return arr.sort(() => Math.floor(Math.random()*3)-1);
}

function compactView(pair) {
  return pair.map(compactRecord);
}

function compactRecord(record) {
  if (record === undefined) return '';
  const copy = new MarcRecord(record);
  copy.fields = copy.fields.filter(field => ['031', '100', '245'].some(tag => tag === field.tag));
  return copy;
}

function readPairFromFile(pairId) {
  const a = JSON.parse(fs.readFileSync(path.resolve(filesPath, `pair_${pairId}_a.json`), 'utf8'));
  const b = JSON.parse(fs.readFileSync(path.resolve(filesPath, `pair_${pairId}_b.json`), 'utf8'));

  return {
    a: {
      record: new MarcRecord(a.record),
      subrecords: a.subrecords.map(sub => new MarcRecord(sub))
    },
    b: {
      record: new MarcRecord(b.record),
      subrecords: b.subrecords.map(sub => new MarcRecord(sub))
    }
  };
}


function loadRecord(recordId) {

  return fetch(`${APIBasePath}/${recordId}`)
    .then(validateResponseStatus)
    .then(response => response.json())
    .then(json => {

      const mainRecord = json.record;
      const subrecords = json.subrecords;

      const marcRecord = new MarcRecord(mainRecord);
      const marcSubRecords = subrecords
        .map(record => new MarcRecord(record));
     
      marcSubRecords.forEach(record => {
        record.fields.forEach(field => {
          field.uuid = uuid.v4();
        });
      });

      marcRecord.fields.forEach(field => {
        field.uuid = uuid.v4();
      });

      return {
        record: marcRecord, 
        subrecords: marcSubRecords
      };

    });


}

function validateResponseStatus(response) {
  if (response.status !== 200) {
    throw new Error(response);
  }
  return response;
}
