import _ from 'lodash';
import { createSelector } from 'reselect';

const compactedRows = state => state.getIn(['ui', 'compactedRows']);
const compactRowsEnabled = state => state.getIn(['ui','compactSubrecordView']);

export const compactRowsMap = createSelector([compactedRows, compactRowsEnabled], (compactedRows, compactRowsEnabled) => {
  if (!compactRowsEnabled) return {};

  return compactedRows.reduce((acc, item) => _.set(acc, item, true), {});
});