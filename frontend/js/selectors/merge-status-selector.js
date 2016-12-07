import _ from 'lodash';
import { createSelector } from 'reselect';
import { subrecordRows } from './subrecord-selectors';
import { CommitMergeStates } from '../constants';

const mergedRecordState = state => state.getIn(['mergedRecord', 'state']);
const commitMergeStatus = state => state.getIn(['mergeStatus', 'status']) || CommitMergeStates.COMMIT_MERGE_NOT_STARTED;

const allSubrecordActionsAreDefined = createSelector([subrecordRows], (subrecordRows) => {

  const firstUndefinedActionIndex = _.findIndex(subrecordRows, ({sourceRecord, targetRecord, selectedAction}) => {
    return selectedAction === undefined && (sourceRecord !== undefined || targetRecord !== undefined);
  });

  return (firstUndefinedActionIndex === -1);

});

export const mergeButtonEnabled = createSelector(
  [mergedRecordState, commitMergeStatus, allSubrecordActionsAreDefined], 
  (mergedRecordState, commitMergeStatus, allSubrecordActionsAreDefined) => {

    const disablingCommitMergeStates = [CommitMergeStates.COMMIT_MERGE_ONGOING, CommitMergeStates.COMMIT_MERGE_COMPLETE];

    const mergeAvailable = !_.includes(disablingCommitMergeStates, commitMergeStatus);
    return (mergedRecordState === 'LOADED' && mergeAvailable && allSubrecordActionsAreDefined);
  }
);
