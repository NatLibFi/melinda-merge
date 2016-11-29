/*

Post-merge:
B warn: Merged record has 041a field with length less than 3. This may break when saved to aleph.

Actions:

Adds LOW tags from source & target
Adds sid fields from source & target (if low is also there). So if source has extra sids, they are dropped.
Adds FCC SID fields if no other sids exist

Adds 035z with (FI-MELINDA)' + other_id },
Adds 035z with (FI-MELINDA)' + preferred_id },

adds 583 "MERGED FROM..."
adds 500 a "Lisäpainokset: " (inferred from 250, and 008)

*/

import _ from 'lodash';
import MarcRecord from 'marc-record-js';

const defaultPreset = [
  check041aLength, addLOWSIDFieldsFromOther, addLOWSIDFieldsFromPreferred, add035zFromOther, add035zFromPreferred, removeExtra035aFromMerged, 
  setAllZeroRecordId, add583NoteAboutMerge, removeCATHistory, add500ReprintInfo];

export const preset = {
  defaults: defaultPreset
};

export function applyPostMergeModifications(postMergeFunctions, preferredRecord, otherRecord, originalMergedRecord) {

  let mergedRecord = new MarcRecord(originalMergedRecord);
  const initial_value = {
    mergedRecord,
    notes: []
  };

  const result = postMergeFunctions.reduce((result, fn) => {
    const fnResult = fn(preferredRecord, otherRecord, result.mergedRecord);

    return {
      mergedRecord: fnResult.mergedRecord,
      notes: _.concat(result.notes, fnResult.notes)
    };
  }, initial_value);

  return { 
    record: result.mergedRecord,
    notes: result.notes
  };
}

function check041aLength(preferredRecord, otherRecord, mergedRecord) {
  const notes = _.chain(mergedRecord.fields)
    .filter(field => field.tag === '041')
    .flatMap(field => field.subfields.filter(subfield => subfield.code === 'a'))
    .filter(subfield => subfield.value.length < 3)
    .map(() => {
      return 'Record has 041a field with length less than 3. This may break when saved to aleph.';
    })
    .value();

  return {
    mergedRecord,
    notes
  };
}

function addLOWSIDFieldsFromOther(preferredRecord, otherRecord, originalMergedRecord) {
  const mergedRecord = new MarcRecord(originalMergedRecord);

  var otherRecordLOWFieldList = otherRecord.fields.filter(field => field.tag === 'LOW');
  mergedRecord.fields = mergedRecord.fields.concat(otherRecordLOWFieldList);


  const otherRecordLibraryIdList = selectValues(otherRecord, 'LOW', 'a');

  otherRecordLibraryIdList.forEach(libraryId => {
    const otherRecordSIDFieldList = selectFieldsByValue(otherRecord, 'SID', 'b', libraryId.toLowerCase());

    if (otherRecordSIDFieldList.length > 0) {

      mergedRecord.fields = _.concat(mergedRecord.fields, otherRecordSIDFieldList);

    } else {

      const otherRecordId = selectRecordId(otherRecord);

      mergedRecord.fields.push({
        tag: 'SID',
        subfields: [
          { code: 'c', value: 'FCC' + otherRecordId },
          { code: 'b', value: libraryId.toLowerCase() },
        ]
      });
    }
  });

  return {
    mergedRecord
  };
}

function addLOWSIDFieldsFromPreferred(preferredRecord, otherRecord, originalMergedRecord) {
  const mergedRecord = new MarcRecord(originalMergedRecord);

  var preferredRecordLOWFieldList = preferredRecord.fields.filter(field => field.tag === 'LOW');
  mergedRecord.fields = mergedRecord.fields.concat(preferredRecordLOWFieldList);


  const preferredRecordLibraryIdList = selectValues(preferredRecord, 'LOW', 'a');

  preferredRecordLibraryIdList.forEach(libraryId => {
    const preferredRecordSIDFieldList = selectFieldsByValue(preferredRecord, 'SID', 'b', libraryId.toLowerCase());

    if (preferredRecordSIDFieldList.length === 0) {

      const preferredRecordId = selectRecordId(preferredRecord);

      mergedRecord.fields.push({
        tag: 'SID',
        subfields: [
          { code: 'c', value: 'FCC' + preferredRecordId },
          { code: 'b', value: libraryId.toLowerCase() },
        ]
      });
    }
  });

  return {
    mergedRecord
  };
}

function add035zFromOther(preferredRecord, otherRecord, originalMergedRecord) {
  const mergedRecord = new MarcRecord(originalMergedRecord);
  const otherRecordId = selectRecordId(otherRecord);
  
  mergedRecord.fields.push({
    tag: '035',
    subfields: [
      { code: 'z', value: '(FI-MELINDA)' + otherRecordId },
    ]
  });

  return {
    mergedRecord
  };
}

function add035zFromPreferred(preferredRecord, otherRecord, originalMergedRecord) {
  const mergedRecord = new MarcRecord(originalMergedRecord);
  const preferredRecordId = selectRecordId(preferredRecord);
  
  mergedRecord.fields.push({
    tag: '035',
    subfields: [
      { code: 'z', value: '(FI-MELINDA)' + preferredRecordId },
    ]
  });

  return {
    mergedRecord
  };
}

function removeExtra035aFromMerged(preferredRecord, otherRecord, originalMergedRecord) {
  const mergedRecord = new MarcRecord(originalMergedRecord);

  mergedRecord.fields = mergedRecord.fields.map(field => {

    if (field.tag === '035') {
      field.subfields = field.subfields.filter(subfield => subfield.code === 'a' && subfield.value.substr(0,12) === '(FI-MELINDA)');
    }
    return field;
  });

  return {
    mergedRecord
  };
}

function setAllZeroRecordId(preferredRecord, otherRecord, originalMergedRecord) {
  const mergedRecord = new MarcRecord(originalMergedRecord);

  mergedRecord.fields = mergedRecord.fields.filter(function(field) {
    return field.tag !== '001';
  });
  mergedRecord.fields.push({
    tag: '001',
    value: '000000000'
  });

  return {
    mergedRecord
  };
}

function add583NoteAboutMerge(preferredRecord, otherRecord, originalMergedRecord) {
  const mergedRecord = new MarcRecord(originalMergedRecord);
  const preferredRecordId = selectRecordId(preferredRecord);
  const otherRecordId = selectRecordId(otherRecord);
  

  mergedRecord.fields.push({
    tag: '583',
    subfields: [
      { code: 'a', value: `MERGED FROM (FI-MELINDA)${otherRecordId} + (FI-MELINDA)${preferredRecordId}` },
      { code: 'c', value: formatDate(new Date()) },
      { code: '5', value: 'MELINDA' },
    ]
  });

  return {
    mergedRecord
  };
}

function removeCATHistory(preferredRecord, otherRecord, originalMergedRecord) {
  const mergedRecord = new MarcRecord(originalMergedRecord);

  mergedRecord.fields = mergedRecord.fields.filter(field => field.tag !== 'CAT');

  return {
    mergedRecord
  };
}
function add500ReprintInfo(preferredRecord, otherRecord, originalMergedRecord) {

  const mergedRecord = new MarcRecord(originalMergedRecord);

  otherRecord.fields
    .filter(field => field.tag === '250')
    .filter(field => {
      return !mergedRecord.fields.some(fieldInMerged => _.isEqual(fieldInMerged, field));
    }).map(function(field) {
      return field.subfields
        .filter(sub => sub.code === 'a')
        .map(sub => sub.value.trim());
    }).forEach(function(reprintText) {
      let text = 'Lisäpainokset: ' + reprintText;
      const f008 = _.head(otherRecord.fields.filter(field => field.tag === '008'));

      if (f008 !== undefined) {
        const year = f008.value.substr(7,4);

        if (!isNaN(year)) {
          text += ` ${year}`;
        }
      }

      if (!/\.$/.test(text)) {
        text += '.';
      }

      if (!mergedRecord.fields.filter(field => field.tag === '500').some(fieldHasSubfield('a', text))) {
        mergedRecord.fields.push({
          tag: '500',
          subfields: [
            { code: 'a', value: text },
          ]
        });
      }
    });

  return {
    mergedRecord
  };
}
 
function fieldHasSubfield(code, value) {
  const querySubfield = { code, value };

  return function(field) {
    return field.subfields.some(subfield => _.isEqual(subfield, querySubfield));
  };
}

function selectFieldsByValue(record, tag, subcode, value) {

  return record.fields
    .filter(field => field.tag === 'SID')
    .filter(field => {
      return field.subfields.some(subfield => subfield.code === subcode && subfield.value === value);
    });
}

function selectValues(record, tag, subcode) {
  return _.chain(record.fields)
    .filter(field => tag.equals(field.tag))
    .flatMap(field => field.subfields)
    .filter(subfield => subcode.equals(subfield.code))
    .map(subfield => subfield.value)
    .filter(value => value !== undefined)
    .value();
}

function selectRecordId(record) {

  const field001List = record.fields.filter(field => field.tag === '001');

  if (field001List.length === 0) {
    throw new Error('Could not parse record id');
  } else {
    return field001List[0].value;
  }
}

function formatDate(date) {
  const tzo = -date.getTimezoneOffset();
  const dif = tzo >= 0 ? '+' : '-';

  return date.getFullYear() +
      '-' + pad(date.getMonth()+1) +
      '-' + pad(date.getDate()) +
      'T' + pad(date.getHours()) +
      ':' + pad(date.getMinutes()) +
      ':' + pad(date.getSeconds()) +
      dif + pad(tzo / 60) +
      ':' + pad(tzo % 60);

  function pad(num) {
    var str = num.toString();
    while(str.length < 2) {
      str = '0' + str;
    }
    return str;
  }
}