
export const selectPreferredHostRecord = state => state.getIn(['targetRecord', 'record']);
export const selectOtherHostRecord = state => state.getIn(['sourceRecord', 'record']);

