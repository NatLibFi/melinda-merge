import _ from 'lodash';

export function insertSubrecordRow(state, rowIndex) {

  const insertUndefinedAtRow = _.curry(insertUndefined)(rowIndex);
 
  return state
    .updateIn(['subrecords', 'sourceRecord'], insertUndefinedAtRow)
    .updateIn(['subrecords', 'targetRecord'], insertUndefinedAtRow)
    .updateIn(['subrecords', 'mergedRecord'], insertUndefinedAtRow)
    .updateIn(['subrecords', 'actions'], insertUndefinedAtRow);

}

export function removeSubrecordRow(state, rowIndex) {
  const removeUndefinedAtRow = _.curry(removeUndefined)(rowIndex);

  const {sourceSubrecords, targetSubrecords} = getSubrecordLists(state);
  if (sourceSubrecords.get(rowIndex) !== undefined || targetSubrecords.get(rowIndex) !== undefined) {
    return state;
  }
 
  return state
    .updateIn(['subrecords', 'sourceRecord'], removeUndefinedAtRow)
    .updateIn(['subrecords', 'targetRecord'], removeUndefinedAtRow)
    .updateIn(['subrecords', 'mergedRecord'], removeUndefinedAtRow)
    .updateIn(['subrecords', 'actions'], removeUndefinedAtRow);

}

export function changeSourceSubrecordRow(state, fromRowIndex, toRowIndex) {
  const swapper = _.partial(swapItems, fromRowIndex, toRowIndex);
  const resetRows = _.partial(resetListIndices, [fromRowIndex, toRowIndex]);

  return state
    .updateIn(['subrecords', 'sourceRecord'], swapper)
    .updateIn(['subrecords', 'mergedRecord'], resetRows)
    .updateIn(['subrecords', 'actions'], resetRows);
}

export function changeTargetSubrecordRow(state, fromRowIndex, toRowIndex) {
  const swapper = _.partial(swapItems, fromRowIndex, toRowIndex);
  const resetRows = _.partial(resetListIndices, [fromRowIndex, toRowIndex]);

  return state
    .updateIn(['subrecords', 'targetRecord'], swapper)
    .updateIn(['subrecords', 'mergedRecord'], resetRows)
    .updateIn(['subrecords', 'actions'], resetRows);
}

export function changeSubrecordRow(state, fromRowIndex, toRowIndex) {
  const changeRow = _.partial(moveRow, fromRowIndex, toRowIndex);

  return state
    .updateIn(['subrecords', 'sourceRecord'], changeRow)
    .updateIn(['subrecords', 'targetRecord'], changeRow)
    .updateIn(['subrecords', 'mergedRecord'], changeRow)
    .updateIn(['subrecords', 'actions'], changeRow);
}

function resetListIndices(rowIndexArr, list) {
  return rowIndexArr.reduce((acc, index) => acc.set(index, undefined), list);
}

function swapItems(fromRowIndex, toRowIndex, list) {
  const from = list.get(fromRowIndex);
  const to = list.get(toRowIndex);

  if (from === undefined || to !== undefined) {
    return list;
  }

  return list
    .set(fromRowIndex, to)
    .set(toRowIndex, from);
}

export function setSubrecordAction(state, rowIndex, actionType) {
  return state.updateIn(['subrecords', 'actions'], actionList => {
    return actionList.set(rowIndex, actionType);
  });
}

export function setMergedSubrecord(state, rowIndex, record) {
  return state.updateIn(['subrecords', 'mergedRecord'], subrecordList => {
    return subrecordList.set(rowIndex, record);
  });
}

export function setMergedSubrecordError(state, rowIndex, error) {
  return state.updateIn(['subrecords', 'mergedRecordErrors'], errorsList => {
    return errorsList.set(rowIndex, error);
  });
}

function moveRow(fromRowIndex, toRowIndex, list) {
  
  const rowToMove = list.get(fromRowIndex);

  const listWithoutRow = list.delete(fromRowIndex);

  const requiredListSize = Math.max(listWithoutRow.size, toRowIndex);

  return listWithoutRow
    .setSize(requiredListSize)
    .insert(toRowIndex, rowToMove);
    
}

function getSubrecordLists(state) {

  const sourceSubrecords = state.getIn(['subrecords', 'sourceRecord']);
  const targetSubrecords = state.getIn(['subrecords', 'targetRecord']);
  const mergedSubrecords = state.getIn(['subrecords', 'mergedRecord']);
 
  return {sourceSubrecords, targetSubrecords, mergedSubrecords};
   
}

function insertUndefined(index, arr) {
  if (index > arr.size) {
    return arr;
  }
  return arr.insert(index, undefined);
}

function removeUndefined(index, arr) {
  if (index > arr.size || arr.get(index) !== undefined) {
    return arr;
  }
  return arr.remove(index, 1);
}

