import _ from 'lodash';
import { createSelector } from 'reselect';

export const subrecordOrder = state => state.getIn(['subrecords', 'index']).toJS();
export const subrecords = state => state.get('subrecords').delete('index').toJS();

export const subrecordRows = createSelector(
  [subrecordOrder, subrecords], (index, subrecords) => {

    return index.map(key => {
      return subrecords[key];
    });

  }
);

export const sourceSubrecords = createSelector([subrecordRows], (subrecordRows) => _.chain(subrecordRows).map('sourceRecord').compact().value());
export const targetSubrecords = createSelector([subrecordRows], (subrecordRows) => _.chain(subrecordRows).map('targetRecord').compact().value());

export const sourceHasSubrecords = createSelector([sourceSubrecords], (sourceSubrecords) => sourceSubrecords.length > 0);
export const targetHasSubrecords = createSelector([targetSubrecords], (targetSubrecords) => targetSubrecords.length > 0);

export const eitherHasSubrecords = createSelector([sourceHasSubrecords, targetHasSubrecords], (source, target) => {
  return source || target;
});

export const rowsWithResultRecord = createSelector([subrecordRows], (subrecordRows) => {
  return subrecordRows.filter(row => row.mergedRecord !== undefined);
});