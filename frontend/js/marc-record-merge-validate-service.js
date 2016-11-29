import _ from 'lodash';

/*

B fail: Both records have same record id
B fail: Record is deleted (source)
B fail: Record is deleted (target)
B fail: Record is suppressed (source)
B fail: Record is suppressed (target)
B fail: Both records have have LOW tag: <LOW-TAG>
B fail: Records are of different type (leader/6): <RECORD-A-LDR6> - <RECORD-B-LDR6>
H fail: record is a component record: <RECORD-ID>

B warn: Record contains long field which has been split to multiple fields. Check that it looks ok. <TAG>
B warn: Other record has LOW: FENNI, but preferred does not.


 */

const defaultPreset = [recordsHaveDifferentIds, preferredRecordIsNotDeleted, otherRecordIsNotDeleted, preferredRecordIsNotSuppressed, otherRecordIsNotSuppressed, recordsHaveSameType];

export const preset = {
  defaults: defaultPreset,
  melinda_host: _.concat(defaultPreset, [recordsHaveDifferentLOWTags, preferredRecordIsNotComponentRecord, otherRecordIsNotComponentRecord]),
  melinda_component: _.concat(defaultPreset, [recordsHaveDifferentLOWTags]),
  melinda_warnings: [preferredRecordFromFENNI, preferredRecordHasAlephSplitFields, otherRecordHasAlephSplitFields]
};

export function validateMergeCandidates(validationFunctions, preferredRecord, otherRecord) {

  const validationResults = validationFunctions.map(fn => fn(preferredRecord, otherRecord));

  return Promise.all(validationResults).then(results => {
    
    const failures = results.filter(result => result.valid === false);
    
    if (failures.length > 0) {
      const failureMessages = failures.map(failure => failure.validationFailureMessage);
      throw new MergeValidationError('Merge validation failed', failureMessages);
    }
    
    return {
      valid: true
    };
  });
}

export function recordsHaveDifferentIds(preferredRecord, otherRecord) {
  return {
    valid: getRecordId(preferredRecord) !== getRecordId(otherRecord),
    validationFailureMessage: 'Both records have the same record id'
  };
}

export function recordsHaveDifferentLOWTags(preferredRecord, otherRecord) {
  
  const preferredRecordLibraryTagList = getLibraryTagList(preferredRecord);
  const otherRecordLibraryTagList = getLibraryTagList(otherRecord);
  
  const libraryTagsInBoth = _.intersection(preferredRecordLibraryTagList, otherRecordLibraryTagList);

  return {
    valid: libraryTagsInBoth.length === 0,
    validationFailureMessage: `Both records have have LOW tags ${libraryTagsInBoth.join(', ')}`
  };
}

export function recordsHaveSameType(preferredRecord, otherRecord) {
  
  var preferredRecordType = preferredRecord.leader.substr(6,1);
  var otherRecordType = otherRecord.leader.substr(6,1);
  
  return {
    valid: preferredRecordType === otherRecordType,
    validationFailureMessage: `Records are of different type (leader/6): ${preferredRecordType} - ${otherRecordType}`
  };
}

export function preferredRecordIsNotDeleted(preferredRecord) {
  return {
    valid: isDeleted(preferredRecord) === false,
    validationFailureMessage: 'Preferred record is deleted'
  };
}

export function otherRecordIsNotDeleted(preferredRecord, otherRecord) {
  return {
    valid: isDeleted(otherRecord) === false,
    validationFailureMessage: 'Other record is deleted'
  };
}


export function preferredRecordIsNotSuppressed(preferredRecord) {
  return {
    valid: isSuppressed(preferredRecord) === false,
    validationFailureMessage: 'Preferred record is suppressed'
  };
}

export function otherRecordIsNotSuppressed(preferredRecord, otherRecord) {
  return {
    valid: isSuppressed(otherRecord) === false,
    validationFailureMessage: 'Other record is suppressed'
  };
}

export function preferredRecordIsNotComponentRecord(preferredRecord) {
  const recordType = preferredRecord.leader.charAt(7);
  const isComponentRecord = ['a','b','d'].some(componentRecordType => componentRecordType === recordType);
  return {
    valid: isComponentRecord === false,
    validationFailureMessage: 'Preferred record is a component record'
  };
}

export function otherRecordIsNotComponentRecord(preferredRecord, otherRecord) {
  const recordType = otherRecord.leader.charAt(7);
  const isComponentRecord = ['a','b','d'].some(componentRecordType => componentRecordType === recordType);
  return {
    valid: isComponentRecord === false,
    validationFailureMessage: 'Other record is a component record'
  };
}

export function preferredRecordFromFENNI(preferredRecord, otherRecord) {
  const preferredRecordLibraryTagList = getLibraryTagList(preferredRecord);
  const otherRecordLibraryTagList = getLibraryTagList(otherRecord);

  const otherHasButPreferredDoesNot = _.includes(otherRecordLibraryTagList, 'FENNI') && !_.includes(preferredRecordLibraryTagList, 'FENNI');

  return {
    valid: otherHasButPreferredDoesNot === false,
    validationFailureMessage: 'The record with FENNI LOW tag should usually be the preferred record'
  };
}

export function preferredRecordHasAlephSplitFields(preferredRecord) {
  const splitFields = preferredRecord.fields.filter(isSplitField);

  const splitFieldTags = _.uniq(splitFields.map(field => field.tag));

  return {
    valid: splitFields.length === 0,
    validationFailureMessage: `The long field ${splitFieldTags.join(', ')} in preferred record has been split to multiple fields. Check that it looks ok.`
  };
}

export function otherRecordHasAlephSplitFields(preferredRecord, otherRecord) {
  const splitFields = otherRecord.fields.filter(isSplitField);

  const splitFieldTags = _.uniq(splitFields.map(field => field.tag));

  return {
    valid: splitFields.length === 0,
    validationFailureMessage: `The long field ${splitFieldTags.join(', ')} in other record has been split to multiple fields. Check that it looks ok.`
  };
}


function isSplitField(field) {
  if (field.subfields !== undefined && field.subfields.length > 0) {
    return field.subfields[0].value.substr(0,2) === '^^';
  }
}

function getLibraryTagList(record) {
  return _.chain(record.fields)
    .filter(field => field.tag === 'LOW')
    .flatMap(field => field.subfields.filter(subfield => subfield.code === 'a'))
    .map('value')
    .value();
}

function isSuppressed(record) {

  return _.chain(record.fields)
    .filter(field => field.tag === 'STA')
    .flatMap(field => field.subfields.filter(subfield => subfield.code === 'a'))
    .some(subfield => subfield.value.toLowerCase() === 'suppressed')
    .value();

}

function isDeleted(record) {

  if (checkLeader()) return true;
  if (checkDELFields()) return true;
  if (checkSTAFields()) return true;
  
  return false;


  function checkLeader() {
    return record.leader.substr(5,1) === 'd';
  }

  function checkDELFields() {
    return _.chain(record.fields)
      .filter(field => field.tag === 'DEL')
      .flatMap(field => field.subfields.filter(subfield => subfield.code === 'a'))
      .some(subfield => subfield.value === 'Y')
      .value();
  }

  function checkSTAFields() {
    return _.chain(record.fields)
      .filter(field => field.tag === 'STA')
      .flatMap(field => field.subfields.filter(subfield => subfield.code === 'a'))
      .some(subfield => subfield.value.toLowerCase() === 'deleted')
      .value();
  }

}


function getRecordId(record) {
  var field001ValuesList = record.fields.filter(field => field.tag === '001').map(field => field.value);
  return _.head(field001ValuesList) || 'unknown';
}

export function MergeValidationError(message, failureMessages) {
  var temp = Error.call(this, message);
  temp.name = this.name = 'MergeValidationError';
  this.stack = temp.stack;
  this.message = temp.message;
  this.failureMessages = failureMessages;
}

MergeValidationError.prototype = Object.create(Error.prototype, {
  constructor: {
    value: MergeValidationError,
    writable: true,
    configurable: true
  }
});
