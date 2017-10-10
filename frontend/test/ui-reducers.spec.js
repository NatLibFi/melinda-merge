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
import _ from 'lodash';
import { INITIAL_STATE } from '../js/root-reducer';
import reducer from '../js/root-reducer';
import MarcRecord from 'marc-record-js';
import { subrecordRows } from '../js/selectors/subrecord-selectors';

describe('ui reducers', () => {

  const testRecordObject = new MarcRecord({
    leader: '^^^^^cam^a22002897i^4500',
    fields: [ 
      { tag: '001', value: '00384794' },
      { tag: '003', value: 'FI-MELINDA' },
      { tag: '008', value: 'SOURCE' },
      { tag: '222', subfields: [{
        code: 'a',
        value: 'The field'
      }]}

    ]
  });

  const otherTestRecordObject = new MarcRecord({
    leader: '^^^^^cam^a22002897i^4500',
    fields: [ 
      { tag: '001', value: '00384794' },
      { tag: '003', value: 'FI-MELINDA' },
      { tag: '005', value: 'FIELD-005' },
      { tag: '008', value: 'TARGET' },
      { tag: '009', value: 'TARGET' },
    ]
  });

  const ssub1 = new MarcRecord({
    leader: '^^^^^cam^a22002897i^4500',
    fields: [ 
      { tag: '001', value: '0000000011' },
      { tag: '008', value: 'SOURCE' },
      { tag: '003', value: 'ssub1' }
    ]
  });

  describe('loadSourceRecord', () => {
    it('sets the state to LOADING', () => {

      const state = INITIAL_STATE;
      
      let nextState = reducer(state, actions.loadSourceRecord('00384794'));

      expect(nextState.get('sourceRecord').toJS()).to.eql({
        id: '00384794',
        state: 'LOADING'
      });
    });
  });

  describe('loadTargetRecord', () => {
    it('sets the state to LOADING', () => {

      const state = INITIAL_STATE;
      let nextState = reducer(state, actions.loadTargetRecord('00384794'));

      expect(nextState.get('targetRecord').toJS()).to.eql({
        id: '00384794',
        state: 'LOADING'
      });
    });
  });

  describe('setSourceRecord', () => {

    it('sets the source record', () => {
      let nextState = reducer(INITIAL_STATE, actions.setSourceRecord(testRecordObject, []));

      expect(nextState.get('sourceRecord').toJS()).to.eql({
        state: 'LOADED',
        record: testRecordObject
      });
    });

    it('sets the source record and subrecords', () => {

      let nextState = reducer(INITIAL_STATE, actions.setSourceRecord(testRecordObject, [ssub1]));

      expect(nextState.get('sourceRecord').toJS()).to.eql({
        state: 'LOADED',
        record: testRecordObject
      });

      const sourceSubrecords = _.map(subrecordRows(nextState), 'sourceRecord');
      expect(sourceSubrecords).to.eql([ssub1]);

    });

  
    it('initialized subrecords to empty correctly', () => {
      let nextState = reducer(INITIAL_STATE, actions.setSourceRecord(testRecordObject));
      const sourceSubrecords = _.map(subrecordRows(nextState), 'sourceRecord');
      expect(sourceSubrecords).to.eql([]);
    });
  });

  describe('setTargetRecord', () => {

    it('sets the target record', () => {

      let nextState = reducer(INITIAL_STATE, actions.setTargetRecord(testRecordObject, []));

      expect(nextState.get('targetRecord').toJS()).to.eql({
        state: 'LOADED',
        record: testRecordObject
      });
    });
  });

  describe('setTargetRecordError', () => {

    it('sets the record state to ERROR and errorMessage', () => {

      let nextState = reducer(INITIAL_STATE, actions.setTargetRecordError('error-message'));

      expect(nextState.get('targetRecord').toJS()).to.eql({
        state: 'ERROR',
        errorMessage: 'error-message'
      });
    });
  });

  describe('setSourceRecordError', () => {

    it('sets the record state to ERROR and errorMessage', () => {

      let nextState = reducer(INITIAL_STATE, actions.setSourceRecordError('error-message'));

      expect(nextState.get('sourceRecord').toJS()).to.eql({
        state: 'ERROR',
        errorMessage: 'error-message'
      });
    });
  });

  describe('merged record', () => {
    let state;
    beforeEach(() => {
      state = reducer(state, actions.setSourceRecord(testRecordObject));
      state = reducer(state, actions.setTargetRecord(otherTestRecordObject));

    });

    it('has state=EMPTY initially', () => {
      expect(state.toJS().mergedRecord).to.eql({
        'state': 'EMPTY'
      });
    });

    it('is has state=EMPTY if target record is not ready', () => {

      const finalState = reducer(state, actions.loadTargetRecord('00384794'));
      
      expect(finalState.toJS().mergedRecord).to.eql({
        'state': 'EMPTY'
      });
    });

    it('is has state=EMPTY if source record is not ready', () => {

      const finalState = reducer(state, actions.loadSourceRecord('00384794'));

      expect(finalState.toJS().mergedRecord).to.eql({
        'state': 'EMPTY'
      });

    });

  });

});
