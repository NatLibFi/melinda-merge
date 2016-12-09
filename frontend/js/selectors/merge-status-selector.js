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

export const recordSaveActionAvailable = createSelector([mergedRecordState], (mergedRecordState) => {
  const enableSaveActionStates = ['SAVE_ONGOING', 'SAVE_FAILED', 'SAVED'];
  return _.includes(enableSaveActionStates, mergedRecordState);
});

export const subrecordActionsEnabled = createSelector([commitMergeStatus], (commitMergeStatus) => {
  return commitMergeStatus !== CommitMergeStates.COMMIT_MERGE_COMPLETE;
});

export const hostRecordActionsEnabled = createSelector([commitMergeStatus], (commitMergeStatus) => {
  return commitMergeStatus !== CommitMergeStates.COMMIT_MERGE_COMPLETE;
});
