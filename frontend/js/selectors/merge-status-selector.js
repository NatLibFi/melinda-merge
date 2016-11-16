import _ from 'lodash';
import { createSelector } from 'reselect';
import { subrecordRows } from './subrecord-selectors';

const mergedRecordState = state => state.getIn(['mergedRecord', 'state']);
const commitMergeStatus = state => state.getIn(['mergeStatus', 'status']) || 'COMMIT_MERGE_AVAILABLE';

const allSubrecordActionsAreDefined = createSelector([subrecordRows], (subrecordRows) => {

  const firstUndefinedActionIndex = _.findIndex(subrecordRows, ({sourceRecord, targetRecord, selectedAction}) => {
    return selectedAction === undefined && (sourceRecord !== undefined || targetRecord !== undefined);
  });

  return (firstUndefinedActionIndex === -1);

});

export const mergeButtonEnabled = createSelector(
  [mergedRecordState, commitMergeStatus, allSubrecordActionsAreDefined], 
  (mergedRecordState, commitMergeStatus, allSubrecordActionsAreDefined) => {

    const mergeAvailable = !_.includes(['COMMIT_MERGE_ONGOING'], commitMergeStatus);
    return (mergedRecordState === 'LOADED' && mergeAvailable && allSubrecordActionsAreDefined);
  }
);
