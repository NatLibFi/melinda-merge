import {expect} from 'chai';
import {List, Map} from 'immutable';
import {loadSourceRecord, setSourceRecord} from '../js/ui-reducers';


describe('ui reducers', () => {

  describe('loadSourceRecord', () => {

    it('is immutable', () => {
      let state = Map({
        sourceRecord: Map({})
      });

      let nextState = loadSourceRecord(state, '00384794');

      expect(nextState).to.equal(Map({
        sourceRecord: Map({
          id: '00384794',
          state: 'LOADING'
        })
      }));

      expect(state).to.equal(Map({
        sourceRecord: Map({})
      }));
    });

  });

  describe('setSourceRecord', () => {

    it('sets the source record', () => {
      let state = Map({
        sourceRecord: Map({
          id: '00384794',
          state: 'LOADING'
        })
      });

      const recordObject = {
        leader: '^^^^^cam^a22002897i^4500',
        fields: [ 
          { tag: '001', value: '00384794' },
          { tag: '003', value: 'FI-MELINDA' }
        ]
      };

      let nextState = setSourceRecord(state, recordObject);

      expect(nextState).to.equal(Map({
        sourceRecord: Map({
          id: '00384794',
          state: 'LOADED',
          record: Map(recordObject)
        })
      }));

    });

  });

});
