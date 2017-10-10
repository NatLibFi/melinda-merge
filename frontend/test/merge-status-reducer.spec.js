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

import {expect} from 'chai';
import * as actions from '../js/ui-actions';
import reducer from '../js/root-reducer';
import { CommitMergeStates } from '../js/constants';

describe('Merge status reducer', () => {

  const errorResponseObject = {
    errors: [{code: -1, message: 'error'}]
  };
  const responseObject = {
    messages: [{code: '0018', message: 'commit merge successful'}]
  };

  describe('on COMMIT_MERGE_START', () => {
    let state;
    let mergeStatus;
    beforeEach(() => {
      state = undefined;
      state = reducer(state, actions.commitMergeStart());
      mergeStatus = state.toJS().mergeStatus;
    });

    it('sets the status to COMMIT_MERGE_ONGOING', () => {
      expect(mergeStatus.status).to.eql(CommitMergeStates.COMMIT_MERGE_ONGOING);
    });

    it('sets the message', () => {
      expect(mergeStatus.message).to.eql('Yhdistetään tietueita');
    });

    it('unsets the response', () => {
      expect(mergeStatus.response).to.equal(undefined);
    });

    it('sets the dialog visible', () => {
      expect(mergeStatus.dialog.visible).to.equal(true);
    });
    
    it('sets the dialog not closable', () => {
      expect(mergeStatus.dialog.closable).to.equal(false);
    });

  });

  describe('on COMMIT_MERGE_ERROR', () => {
    let state;
    let mergeStatus;
    beforeEach(() => {
      state = undefined;
      state = reducer(state, actions.commitMergeError('error', errorResponseObject));
      mergeStatus = state.toJS().mergeStatus;
    });

    it('sets the status to COMMIT_MERGE_ERROR', () => {
      expect(mergeStatus.status).to.eql(CommitMergeStates.COMMIT_MERGE_ERROR);
    });

    it('sets the message to error', () => {
      expect(mergeStatus.message).to.eql('error');
    });

    it('sets the response', () => {
      expect(mergeStatus.response).to.eql(errorResponseObject);
    });
    
    it('keeps the dialog as is', () => {
      expect(mergeStatus.dialog.visible).to.equal(false);
    });
    
    it('sets the dialog closable', () => {
      expect(mergeStatus.dialog.closable).to.equal(true);
    });

  });

  describe('on COMMIT_MERGE_SUCCESS', () => {
    let state;
    let mergeStatus;
    beforeEach(() => {
      state = undefined;
      state = reducer(state, actions.commitMergeSuccess('ok', responseObject));
      mergeStatus = state.toJS().mergeStatus;
    });

    it('sets the status to COMMIT_MERGE_ERROR', () => {
      expect(mergeStatus.status).to.eql(CommitMergeStates.COMMIT_MERGE_COMPLETE);
    });

    it('sets the message to error', () => {
      expect(mergeStatus.message).to.eql('Tietueet yhdistetty tietueeksi ok');
    });

    it('sets the response', () => {
      expect(mergeStatus.response).to.eql(responseObject);
    });
    
    it('keeps the dialog as is', () => {
      expect(mergeStatus.dialog.visible).to.equal(false);
    });
    
    it('sets the dialog closable', () => {
      expect(mergeStatus.dialog.closable).to.equal(true);
    });

  });

});
