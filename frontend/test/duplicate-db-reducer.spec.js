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
import * as actions from '../js/action-creators/duplicate-database-actions';
import * as recordActions from '../js/ui-actions';
import { INITIAL_STATE } from '../js/root-reducer';
import reducer from '../js/root-reducer';

describe('Duplicate database reducers', () => {

  const currentPair = {
    created: '2016-06-22 11:54:19',
    duplicatePairId: '262426',
    otherRecordId: '00384794',
    preferredRecordId: '006649151',
    systemMessage: 'message from the creator of this candidate pair',
  };

  describe('fetchNextPairSuccess', () => {
    let state;
    let duplicateDatabase;
    beforeEach(() => {
      state = undefined;
      state = reducer(state, actions.fetchNextPairSuccess(currentPair));
      duplicateDatabase = state.toJS().duplicateDatabase;
    });

    it('sets the current duplicate pair', () => {
      expect(duplicateDatabase.currentPair).to.eql(currentPair);
    });

    it('sets the the duplicate database status to READY', () => {
      expect(duplicateDatabase.status).to.eql('READY');
    });

    describe('and then loading a new source record which is not either of currentpair', () => {
      beforeEach(() => {
        state = undefined;
        state = reducer(state, actions.fetchNextPairSuccess(currentPair));
        state = reducer(state, recordActions.setSourceRecord({}, [], '00384791'));
        duplicateDatabase = state.getIn(['duplicateDatabase']).toJS();
      });

      it('erases currentPair', () => {
        expect(duplicateDatabase.currentPair).to.eql({});
      });

      it('keeps the status READY', () => {
        expect(duplicateDatabase.status).to.eql('READY');
      });
    });

    describe('and then loading a new target record which is not either of currentpair', () => {
      beforeEach(() => {
        state = INITIAL_STATE;
        state = reducer(state, actions.fetchNextPairSuccess(currentPair));
        state = reducer(state, recordActions.setTargetRecord({}, [], '00384791'));
        duplicateDatabase = state.getIn(['duplicateDatabase']).toJS();
      });

      it('erases currentPair', () => {
        expect(duplicateDatabase.currentPair).to.eql({});
      });

      it('keeps the status READY', () => {
        expect(duplicateDatabase.status).to.eql('READY');
      });
    });

    describe('and then loading a new source record that is either of the currentpair', () => {
      beforeEach(() => {
        state = INITIAL_STATE;
        state = reducer(state, actions.fetchNextPairSuccess(currentPair));
        state = reducer(state, recordActions.setSourceRecord({}, [], '00384794'));
        duplicateDatabase = state.getIn(['duplicateDatabase']).toJS();
      });

      it('keeps the currentPair', () => {
        expect(duplicateDatabase.currentPair).to.eql(currentPair);
      });

      it('keeps the status READY', () => {
        expect(duplicateDatabase.status).to.eql('READY');
      });
    });

    describe('and then loading a new target record that is either of the currentpair', () => {
      beforeEach(() => {
        state = INITIAL_STATE;
        state = reducer(state, actions.fetchNextPairSuccess(currentPair));
        state = reducer(state, recordActions.setTargetRecord({}, [], '00384794'));
        duplicateDatabase = state.getIn(['duplicateDatabase']).toJS();
      });

      it('keeps the currentPair', () => {
        expect(duplicateDatabase.currentPair).to.eql(currentPair);
      });

      it('keeps the status READY', () => {
        expect(duplicateDatabase.status).to.eql('READY');
      });
    });
  });

});
