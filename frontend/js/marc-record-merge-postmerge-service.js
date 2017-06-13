/*

Post-merge:
B warn: Merged record has 041a field with length less than 3. This may break when saved to aleph.

Actions:

Adds LOW tags from source & target
Adds sid fields from source & target (if low is also there). So if source has extra sids, they are dropped.
Adds extra SID volsi for VOLTE (Todo: make these pairs configurable)
Adds FCC SID fields if no other sids exist

Adds 035z with (FI-MELINDA)' + other_id },
Adds 035z with (FI-MELINDA)' + preferred_id },

adds 583 "MERGED FROM..."
adds 500 a "Lisäpainokset: " (inferred from 250, and 008)

*/

import _ from 'lodash';
import MarcRecord from 'marc-record-js';
import uuid from 'node-uuid';
import moment from 'moment';
import { selectValues, selectRecordId, selectFieldsByValue, fieldHasSubfield, resetComponentHostLinkSubfield, isLinkedFieldOf } from './record-utils';
import { fieldOrderComparator } from './marc-field-sort';

const defaultPreset = [
  check041aLength, addLOWSIDFieldsFromOther, addLOWSIDFieldsFromPreferred, add035zFromOther, add035zFromPreferred, removeExtra035aFromMerged, 
  setAllZeroRecordId, add583NoteAboutMerge, removeCATHistory, add500ReprintInfo, handle880Fields, sortMergedRecordFields];

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
      notes: _.concat(result.notes, fnResult.notes || [])
    };
  }, initial_value);

  return { 
    record: result.mergedRecord,
    notes: result.notes
  };
}

export function check041aLength(preferredRecord, otherRecord, mergedRecord) {
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

export function addLOWSIDFieldsFromOther(preferredRecord, otherRecord, mergedRecordParam) {
  const mergedRecord = new MarcRecord(mergedRecordParam);

  var otherRecordLOWFieldList = otherRecord.fields
    .filter(field => field.tag === 'LOW')
    .map(markAsPostmergeField);

  mergedRecord.fields = mergedRecord.fields.concat(otherRecordLOWFieldList);

  const otherRecordLibraryIdList = selectValues(otherRecord, 'LOW', 'a');

  otherRecordLibraryIdList.forEach(libraryId => {
    const otherRecordSIDFieldList = selectFieldsByValue(otherRecord, 'SID', 'b', libraryId.toLowerCase());

    if (otherRecordSIDFieldList.length > 0) {

      mergedRecord.fields = _.concat(mergedRecord.fields, otherRecordSIDFieldList.map(markAsPostmergeField));

    } else {

      const otherRecordId = selectRecordId(otherRecord);

      mergedRecord.fields.push(createField({
        tag: 'SID',
        subfields: [
          { code: 'c', value: 'FCC' + otherRecordId },
          { code: 'b', value: libraryId.toLowerCase() },
        ]
      }));
    }
  });
  
  otherRecordLibraryIdList.forEach(libraryId => {
  /* TODO: Add here config -table for extra SID $b value / libraryID pairs */
    
    if (libraryId == 'VOLTE') {
      const otherRecordSIDExtraFieldList = selectFieldsByValue(otherRecord, 'SID', 'b', 'volsi');

      if (otherRecordSIDExtraFieldList.length > 0) {

        mergedRecord.fields = _.concat(mergedRecord.fields, otherRecordSIDExtraFieldList.map(markAsPostmergeField));

      }   
    }
  });

  
  
  return {
    mergedRecord
  };
}

export function addLOWSIDFieldsFromPreferred(preferredRecord, otherRecord, mergedRecordParam) {
  const mergedRecord = new MarcRecord(mergedRecordParam);

  const preferredRecordLibraryIdList = selectValues(preferredRecord, 'LOW', 'a');

  preferredRecordLibraryIdList.forEach(libraryId => {
    const preferredRecordSIDFieldList = selectFieldsByValue(preferredRecord, 'SID', 'b', libraryId.toLowerCase());

    if (preferredRecordSIDFieldList.length === 0) {

      const preferredRecordId = selectRecordId(preferredRecord);

      mergedRecord.fields.push(createField({
        tag: 'SID',
        subfields: [
          { code: 'c', value: 'FCC' + preferredRecordId },
          { code: 'b', value: libraryId.toLowerCase() },
        ]
      }));
    }
  });
  
  return {
    mergedRecord
  };
}

export function add035zFromOther(preferredRecord, otherRecord, mergedRecordParam) {
  const mergedRecord = new MarcRecord(mergedRecordParam);
  const otherRecordId = selectRecordId(otherRecord);
  
  mergedRecord.fields.push(createField({
    tag: '035',
    subfields: [
      { code: 'z', value: '(FI-MELINDA)' + otherRecordId },
    ]
  }));

  return {
    mergedRecord
  };
}

export function add035zFromPreferred(preferredRecord, otherRecord, mergedRecordParam) {
  const mergedRecord = new MarcRecord(mergedRecordParam);
  const preferredRecordId = selectRecordId(preferredRecord);
  
  mergedRecord.fields.push(createField({
    tag: '035',
    subfields: [
      { code: 'z', value: '(FI-MELINDA)' + preferredRecordId },
    ]
  }));

  return {
    mergedRecord
  };
}

export function removeExtra035aFromMerged(preferredRecord, otherRecord, mergedRecordParam) {
  const mergedRecord = new MarcRecord(mergedRecordParam);

  mergedRecord.fields = mergedRecord.fields.reduce((fields, field) => {

    if (field.tag === '035') {
      field.subfields = field.subfields.filter(subfield => {
        const isExtraSubfield = subfield.code === 'a' && subfield.value.substr(0,12) === '(FI-MELINDA)';
        return isExtraSubfield === false;
      });

      if (field.subfields.length == 0) {

        markFieldAsUnused(otherRecord, field.uuid);
        markFieldAsUnused(preferredRecord, field.uuid);

        return fields;
      }
    }

    return _.concat(fields, field);
  }, []);

  return {
    mergedRecord
  };
}


export function setAllZeroRecordId(preferredRecord, otherRecord, mergedRecordParam) {
  const mergedRecord = new MarcRecord(mergedRecordParam);

  mergedRecord.fields = mergedRecord.fields.filter(function(field) {
    return field.tag !== '001';
  });
  mergedRecord.fields.push(createField({
    tag: '001',
    value: '000000000'
  }));

  return {
    mergedRecord
  };
}

export function add583NoteAboutMerge(preferredRecord, otherRecord, mergedRecordParam) {
  const mergedRecord = new MarcRecord(mergedRecordParam);
  const preferredRecordId = selectRecordId(preferredRecord);
  const otherRecordId = selectRecordId(otherRecord);
  
  mergedRecord.fields.push(createField({
    tag: '583',
    subfields: [
      { code: 'a', value: `MERGED FROM (FI-MELINDA)${otherRecordId} + (FI-MELINDA)${preferredRecordId}` },
      { code: 'c', value: formatDate(new Date()) },
      { code: '5', value: 'MELINDA' },
    ]
  }));

  return {
    mergedRecord
  };
}

export function removeCATHistory(preferredRecord, otherRecord, mergedRecordParam) {
  const mergedRecord = new MarcRecord(mergedRecordParam);

  mergedRecord.fields = mergedRecord.fields.filter(field => field.tag !== 'CAT');

  return {
    mergedRecord
  };
}

export function add500ReprintInfo(preferredRecord, otherRecord, mergedRecordParam) {

  const mergedRecord = new MarcRecord(mergedRecordParam);

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
        mergedRecord.fields.push(createField({
          tag: '500',
          subfields: [
            { code: 'a', value: text },
          ]
        }));
      }
    });

  return {
    mergedRecord
  };
}

export function handle880Fields(preferredRecord, otherRecord, mergedRecordParam) {
  const mergedRecord = new MarcRecord(mergedRecordParam);

  const fieldsWithout880 = mergedRecord.fields.filter(field => field.tag !== '880');

  const fieldsWithLinkedContent = fieldsWithout880
    .filter(field => field.subfields)
    .filter(field => field.subfields.some(subfield => subfield.code === '6'));

  const relinked880Fields = _.chain(fieldsWithLinkedContent).flatMap((field, i) => {

    const fieldInPreferred = _.chain(preferredRecord.fields).filter(fieldInPreferred => fieldInPreferred.uuid === field.uuid).value();
    const fieldInOther = _.chain(otherRecord.fields).filter(otherRecord => otherRecord.uuid === field.uuid).value();
    
    const linkedFieldsFromPreferred = _.flatMap(fieldInPreferred, (fieldWithLink) => {
      return preferredRecord.fields.filter(isLinkedFieldOf(fieldWithLink));
    });

    const linkedFieldsFromOther = _.flatMap(fieldInOther, (fieldWithLink) => {
      return otherRecord.fields.filter(isLinkedFieldOf(fieldWithLink));
    });

    linkedFieldsFromPreferred.forEach(field => {
      markFieldAsUsed(field, {fromOther: false});
    });

    linkedFieldsFromOther.forEach(field => {
      markFieldAsUsed(field, {fromOther: true});
    });
    
    const linkedFields = _.concat(_.cloneDeep(linkedFieldsFromPreferred), _.cloneDeep(linkedFieldsFromOther));

    updateLinks(i+1, field, linkedFields);

    return linkedFields;
    
  }).value();

  mergedRecord.fields = _.concat(fieldsWithout880, relinked880Fields);

  const dropped880Fields = _.differenceBy(mergedRecordParam.fields, mergedRecord.fields, 'uuid');
  dropped880Fields.map(field => field.uuid).forEach(uuid => {
    markFieldAsUnused(preferredRecord, uuid);
    markFieldAsUnused(otherRecord, uuid);
  });
  
  return { mergedRecord };
}

function updateLinks(linkIndex, field, linkedFieldList) {
  const tag = field.tag;
  const linkIndexNormalized = _.padStart(linkIndex, 2, '0');

  field.subfields.forEach(sub => {
    if (sub.code === '6') {
      sub.value = `880-${linkIndexNormalized}`;
    }
  });
  
  linkedFieldList.forEach(field => {
    field.subfields.forEach(sub => {
      if (sub.code === '6') {
        sub.value = `${tag}-${linkIndexNormalized}`;
      }
    });
  });
}

export function sortMergedRecordFields(preferredRecord, otherRecord, mergedRecordParam) {
  const mergedRecord = new MarcRecord(mergedRecordParam);

  mergedRecord.fields.sort(fieldOrderComparator);

  return { mergedRecord };
}

export function select773Fields(preferredHostRecordId, othterHostRecordId) {
  return function(preferredRecord, otherRecord, mergedRecord) {
  
    const linksToPreferredHost = mergedRecord.fields.filter(field => {
      return field.tag === '773' && field.subfields.filter(s => s.code === 'w').some(s => s.value === `(FI-MELINDA)${preferredHostRecordId}`);
    });
    const linksToOtherHost = mergedRecord.fields.filter(field => {
      return field.tag === '773' && field.subfields.filter(s => s.code === 'w').some(s => s.value === `(FI-MELINDA)${othterHostRecordId}`);
    });

    const fieldsWithoutLinks = _.difference(mergedRecord.fields, _.concat(linksToPreferredHost, linksToOtherHost));

    if (linksToPreferredHost.length > 0) {
      mergedRecord.fields = _.concat(fieldsWithoutLinks, linksToPreferredHost.map(resetComponentHostLinkSubfield));
      linksToOtherHost.map(field => field.uuid).forEach(uuid => markFieldAsUnused(otherRecord, uuid));
    } else {
      mergedRecord.fields = _.concat(fieldsWithoutLinks, linksToOtherHost.map(resetComponentHostLinkSubfield));
      linksToPreferredHost.map(field => field.uuid).forEach(uuid => markFieldAsUnused(preferredRecord, uuid));
    }

    return {
      mergedRecord
    };

  };
}


function markAsPostmergeField(field) {
  field.fromPostmerge = true;
  return field;
}

function createField(fieldContent) {
  return _.assign({}, {
    uuid: uuid.v4(),
    fromPostmerge: true,
    ind1: ' ',
    ind2: ' '
  }, fieldContent);
}

function formatDate(date) {
  return moment(date).format('YYYY-MM-DDTHH:mm:ssZ');
}

function markFieldAsUnused(record, fieldUuid) {
  record.fields
    .filter(field => field.uuid === fieldUuid)
    .forEach(field => {
      delete(field.wasUsed);
      delete(field.fromOther);
    });
}

function markFieldAsUsed(field, opts) {
  field.wasUsed = true;
  if (opts && opts.fromOther !== undefined) {
    field.fromOther = opts.fromOther;
  }
}
