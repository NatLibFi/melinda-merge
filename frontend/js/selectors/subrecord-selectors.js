import _ from 'lodash';
import { createSelector } from 'reselect';
import { List } from 'immutable';

const sourceRecordList = state => state.getIn(['subrecords',  'sourceRecord'], List()).toJS();
const targetRecordList = state => state.getIn(['subrecords',  'targetRecord'], List()).toJS();
const mergedRecordList = state => state.getIn(['subrecords',  'mergedRecord'], List()).toJS();
const actionsList = state => state.getIn(['subrecords',  'actions'], List()).toJS();
const expandedList = state => state.getIn(['subrecords', 'expanded'], List()).toJS();

export const subrecordRows2 = createSelector(
  [sourceRecordList, targetRecordList, mergedRecordList, actionsList, expandedList], 
  (sourceRecordList, targetRecordList, mergedRecordList, actionsList, expandedList) => {

    return _.zip(sourceRecordList, targetRecordList, mergedRecordList, actionsList, expandedList)
      .map(([sourceRecord, targetRecord, mergedRecord, selectedAction, isExpanded]) => {
        return {
          sourceRecord, targetRecord, mergedRecord, selectedAction, isExpanded
        };
      });

  }
);

export const subrecordOrder = state => state.getIn(['subrecords', 'index']).toJS();
export const subrecords = state => state.get('subrecords').delete('index').toJS();

export const subrecordRows = createSelector(
  [subrecordOrder, subrecords], (index, subrecords) => {

    return index.map(key => {
      return subrecords[key];
    });

  }
);

export const sourceHasSubrecords = createSelector([subrecordRows], (subrecordRows) => _.chain(subrecordRows).map('sourceRecord').compact().value().length > 0);
export const targetHasSubrecords = createSelector([subrecordRows], (subrecordRows) => _.chain(subrecordRows).map('targetRecord').compact().value().length > 0);

export const eitherHasSubrecords = createSelector([sourceHasSubrecords, targetHasSubrecords], (source, target) => {
  return source || target;
});
