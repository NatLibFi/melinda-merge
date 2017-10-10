/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* UI for merging MARC records
*
* Copyright (C) 2015-2017 University Of Helsinki (The National Library Of Finland)
*
* This file is part of marc-merge-ui
*
* marc-merge-ui program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* oai-pmh-server-backend-module-melinda is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/


export const ItemTypes = {
  SUBRECORD: 'SUBRECORD',
  TARGET_SUBRECORD: 'TARGET',
  SOURCE_SUBRECORD: 'SOURCE',
  MERGED_SUBRECORD: 'MERGED',
  SUBRECORD_ROW: 'SUBRECORD_ROW'
};

export const DuplicateDatabaseStates = {
  FETCH_NEXT_DUPLICATE_ONGOING: 'FETCH_NEXT_DUPLICATE_ONGOING',
  SKIP_PAIR_ONGOING: 'SKIP_PAIR_ONGOING',
  MARK_AS_NON_DUPLICATE_ONGOING: 'MARK_AS_NON_DUPLICATE_ONGOING',
  MARK_AS_MERGED_ONGOING: 'MARK_AS_MERGED_ONGOING',
  READY: 'READY'
};

export const SubrecordActionTypes = {
  BLOCK: 'BLOCK',
  MERGE: 'MERGE',
  COPY: 'COPY',
  UNSET: 'UNSET'
};

export const CommitMergeStates = {
  COMMIT_MERGE_NOT_STARTED: 'COMMIT_MERGE_NOT_STARTED',
  COMMIT_MERGE_ONGOING: 'COMMIT_MERGE_ONGOING',
  COMMIT_MERGE_ERROR: 'COMMIT_MERGE_ERROR',
  COMMIT_MERGE_COMPLETE: 'COMMIT_MERGE_COMPLETE'
};

export const RecordSaveStatus = {
  'UNSAVED': 'UNSAVED',
  'SAVED': 'SAVED',
  'SAVE_ONGOING': 'SAVE_ONGOING',
  'SAVE_FAILED': 'SAVE_FAILED'
};
