import _ from 'lodash';
import { selectFirstValue, fieldHasSubfield } from './record-utils';

const sorterFunctions = [sortByTag, sortByLOW, sortBySID, sortByIndexterms, sortAlphabetically];

export function fieldOrderComparator(fieldA, fieldB) {
  for (let sortFn of sorterFunctions) {
    const result = sortFn(fieldA, fieldB);
    if (result != 0) return result;
  }

  return 0;    
}

const sortIndex = {
  LDR: '000',
  STA: '0091',
  LOW: '9991',
  SID: '9992',
  CAT: '9993',
  HLI: '9994'
};

function getSortIndex(tag) {
  if (isNaN(tag)) {
    return _.get(sortIndex, tag, '9999');
  }
  return tag;
}

function sortByTag(fieldA, fieldB) {
  const orderA = getSortIndex(fieldA.tag);
  const orderB = getSortIndex(fieldB.tag);

  if (orderA > orderB) return 1;
  if (orderA < orderB) return -1;

  return 0;
}

function sortByLOW(fieldA, fieldB) {
  if (fieldA.tag === 'LOW' && fieldB.tag === 'LOW') {
    const lowA = selectFirstValue(fieldA, 'a');
    const lowB = selectFirstValue(fieldB, 'a');
    if (lowA > lowB) return 1;
    if (lowA < lowB) return -1;
  }
  return 0;
}

function sortBySID(fieldA, fieldB) {
  if (fieldA.tag === 'SID' && fieldB.tag === 'SID') {
    const sidA = selectFirstValue(fieldA, 'b');
    const sidB = selectFirstValue(fieldB, 'b');
    if (sidA > sidB) return 1;
    if (sidA < sidB) return -1;
  }
  return 0;
}

const dictionarySortIndex = {
  'ysa': '0',
  'allars': '1',
  'musa': '2',
  'cilla': '3',
  'kaunokki': '4',
  'bella': '5'
};

function sortByIndexterms(fieldA, fieldB) {
  const indexTermFields = [
    '600','610','611','630','648','650','651','652',
    '653','654','655','656','657','658','659','662'];

  if (fieldA.tag === fieldB.tag && _.includes(indexTermFields, fieldA.tag)) {
    if (fieldA.ind2 > fieldB.ind2) return 1;
    if (fieldA.ind2 < fieldB.ind2) return -1;

    const dictionaryA = selectFirstValue(fieldA, '2');
    const dictionaryB = selectFirstValue(fieldB, '2');
    
    const orderByDictionaryA = _.get(dictionarySortIndex, dictionaryA, dictionaryA);
    const orderByDictionaryB = _.get(dictionarySortIndex, dictionaryB, dictionaryB);

    if (orderByDictionaryA > orderByDictionaryB) return 1;
    if (orderByDictionaryA < orderByDictionaryB) return -1;

    const fenniKeepSelector = fieldHasSubfield('9', 'FENNI<KEEP>');
    const fenniDropSelector = fieldHasSubfield('9', 'FENNI<DROP>');
    const hasFENNI9A = fenniKeepSelector(fieldA) || fenniDropSelector(fieldA);
    const hasFENNI9B = fenniKeepSelector(fieldB) || fenniDropSelector(fieldA);
    
    if (hasFENNI9A && !hasFENNI9B) return -1;
    if (!hasFENNI9A && hasFENNI9B) return 1;

    const valueA = selectFirstValue(fieldA, 'a');
    const valueB = selectFirstValue(fieldB, 'a');

    if (valueA > valueB) return 1;
    if (valueA < valueB) return -1;

    const valueAX = selectFirstValue(fieldA, 'x');
    const valueBX = selectFirstValue(fieldB, 'x');

    if (valueAX > valueBX) return 1;
    if (valueAX < valueBX) return -1;
    
    const valueAZ = selectFirstValue(fieldA, 'z');
    const valueBZ = selectFirstValue(fieldB, 'z');

    if (valueAZ > valueBZ) return 1;
    if (valueAZ < valueBZ) return -1;
    
    const valueAY = selectFirstValue(fieldA, 'y');
    const valueBY = selectFirstValue(fieldB, 'y');
    if (valueAY > valueBY) return 1;
    if (valueAY < valueBY) return -1;
    
  }
  return 0;
}


function sortAlphabetically(fieldA, fieldB) {
  if (fieldA.tag === fieldB.tag) {
    
    const valueA = selectFirstValue(fieldA, anySelector);
    const valueB = selectFirstValue(fieldB, anySelector);

    if (valueA > valueB) return 1;
    if (valueA < valueB) return -1;
  }
  return 0;
}

const anySelector = {
  equals: () => true
};
