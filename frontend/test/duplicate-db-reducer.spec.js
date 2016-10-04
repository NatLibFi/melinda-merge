import {expect} from 'chai';
import * as actions from '../js/action-creators/duplicate-database-actions';
import * as recordActions from '../js/ui-actions';
import { setCurrentDuplicatePair } from '../js/reducers/duplicate-db-reducer';
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

  describe('setCurrentDuplicatePair', () => {
    let state;
    let duplicateDatabase;
    beforeEach(() => {
      state = INITIAL_STATE;
      state = setCurrentDuplicatePair(state, currentPair);
      duplicateDatabase = state.toJS();
    });

    it('sets the current duplicate pair', () => {
      expect(duplicateDatabase.currentPair).to.eql(currentPair);
    });

    it('sets the the duplicate database status to READY', () => {
      expect(duplicateDatabase.status).to.eql('READY');
    });

    describe('and then loading a new source record which is not either of currentpair', () => {
      beforeEach(() => {
        state = INITIAL_STATE;
        state = reducer(state, actions.fetchNextPairSuccess(currentPair));
        state = reducer(state, recordActions.loadSourceRecord('00384791'));
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
        state = reducer(state, recordActions.loadTargetRecord('00384791'));
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
        state = reducer(state, recordActions.loadSourceRecord('00384794'));
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
        state = reducer(state, recordActions.loadTargetRecord('00384794'));
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
