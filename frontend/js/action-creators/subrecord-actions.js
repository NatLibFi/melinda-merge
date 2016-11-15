import { EXPAND_SUBRECORD_ROW, COMPRESS_SUBRECORD_ROW } from '../constants/action-type-constants';

export function expandSubrecordRow(rowIndex) {
  return { type: EXPAND_SUBRECORD_ROW, rowIndex };
}

export function compressSubrecordRow(rowIndex) {
  return { type: COMPRESS_SUBRECORD_ROW, rowIndex };
}
