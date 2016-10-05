import { List } from 'immutable';
import _ from 'lodash';
import { createSelector } from 'reselect';


const mergedRecordState = state => state.getIn(['mergedRecord', 'state']);
const commitMergeStatus = state => state.getIn(['mergeStatus', 'status']) || 'COMMIT_MERGE_AVAILABLE';

const sourceSubrecords = state => state.getIn(['subrecords', 'sourceRecord'], List());
const targetSubrecords = state => state.getIn(['subrecords', 'targetRecord'], List());
const selectedActions = state => state.getIn(['subrecords', 'actions'], List());


const allSubrecordActionsAreDefined = createSelector(
  [sourceSubrecords, targetSubrecords, selectedActions],
  (sourceSubrecords, targetSubrecords, selectedActions) => {

    const firstUndefinedActionIndex = _.findIndex(_.zip(sourceSubrecords.toJS(), targetSubrecords.toJS(), selectedActions.toJS()), ([source, target, action]) => {
      return action === undefined && (source !== undefined || target !== undefined);
    });

    return (firstUndefinedActionIndex === -1);

  }
);


export const mergeButtonEnabled = createSelector(
  [mergedRecordState, commitMergeStatus, allSubrecordActionsAreDefined], 
  (mergedRecordState, commitMergeStatus, allSubrecordActionsAreDefined) => {

    const mergeAvailable = !_.includes(['COMMIT_MERGE_ONGOING'], commitMergeStatus);
    return (mergedRecordState === 'LOADED' && mergeAvailable && allSubrecordActionsAreDefined);
  }
);
