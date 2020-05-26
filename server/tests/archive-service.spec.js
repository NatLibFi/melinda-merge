/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* UI for merging MARC records in Melinda
*
* Copyright (C) 2015-2018 University Of Helsinki (The National Library Of Finland)
*
* This file is part of melinda-merge
*
* melinda-merge program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* melinda-merge is distributed in the hope that it will be useful,
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

import _ from 'lodash';
import sinon from 'sinon';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import archiver from 'archiver';
import { __RewireAPI__ as RewireAPI } from '../archive-service';
import { createArchive, anonymizeRecord } from '../archive-service';
import {MarcRecord} from '@natlibfi/marc-record';

MarcRecord.setValidationOptions({fields: false, subfields: false, subfieldValues: false});
const Writable = require('stream').Writable;
const expect = chai.expect;
chai.use(sinonChai);

describe('Archive service', () => {

  const username = 'test-user';

  const removedRecord = {
    record: new MarcRecord({fields: [{ tag: '001', value: '1' }, { tag: 'CAT', subfields: [{code: 'a', value: 'foobar'}]}]}),
    subrecords: []
  };

  const preferredRecord = {
    record: new MarcRecord({fields: [{ tag: '001', value: '2' }, { tag: 'CAT', subfields: [{code: 'a', value: 'foobar'}]}]}),
    subrecords: []
  };

  const mergedRecord = {
    record: new MarcRecord({fields: [{ tag: '001', value: '3' }, { tag: 'CAT', subfields: [{code: 'a', value: 'foobar'}]}]}),
    subrecords: []
  };

  const unmodifiedMergedRecord = {
    record: new MarcRecord({fields: [{ tag: '001', value: '3' }, { tag: 'CAT', subfields: [{code: 'a', value: 'foobar'}]}]}),
    subrecords: []
  };

  const mergedRecordId = '234723';

  describe('createArchive without subrecords', () => {

    let archiveAppendSpy;

    beforeEach(() => {
      const createWriteStreamStub = sinon.stub();

      const mockedStream = new Writable({
        write(chunk, encoding, callback) {
          callback();
        },
      });

      mockedStream.on('finish', () => mockedStream.emit('close'));

      RewireAPI.__Rewire__('fs', {
        createWriteStream: createWriteStreamStub.returns(mockedStream)
      });
      RewireAPI.__Rewire__('archiver', function(type) {
        const archive = archiver(type);
        archiveAppendSpy = sinon.spy(archive, 'append');
        return archive;
      });

      return createArchive(username, removedRecord, preferredRecord, mergedRecord, unmodifiedMergedRecord, mergedRecordId);
    });
    afterEach(() => {
      RewireAPI.__ResetDependency__('fs');
      RewireAPI.__ResetDependency__('archiver');
    });

    it('adds removed record to the archive', () => {
      expect(callsTo(archiveAppendSpy)).to.deep.include({data: anonymizeRecord(removedRecord.record).toString(), name: 'removed.txt'});
    });

    it('adds preferred record to the archive', () => {
      expect(callsTo(archiveAppendSpy)).to.deep.include({data: anonymizeRecord(preferredRecord.record).toString(), name: 'preferred.txt'});
    });

    it('adds merged record to the archive', () => {
      expect(callsTo(archiveAppendSpy)).to.deep.include({data: anonymizeRecord(mergedRecord.record).toString(), name: 'merged.txt'});
    });

    it('adds unmodified merged record to the archive', () => {
      expect(callsTo(archiveAppendSpy)).to.deep.include({data: anonymizeRecord(unmodifiedMergedRecord.record).toString(), name: 'merged-unmodified.txt'});
    });

    it('does not add subrecords of removed record to the archive', () => {
      expect(callsTo(archiveAppendSpy).map(n => n.name)).not.to.include('removed-subrecords.txt');
    });

    it('adds metadata to the archive', () => {
      const metadata = JSON.parse(metadataCall(archiveAppendSpy).data);
      expect(metadata.date).to.not.be.undefined;
      delete(metadata.date);

      expect(metadata).to.eql({
        removedRecordId: '1',
        preferredRecordId: '2',
        mergedRecordId: mergedRecordId
      });
    });

  });

  describe('createArchive with subrecords', () => {
    let archiveAppendSpy;

    beforeEach(() => {
      const createWriteStreamStub = sinon.stub();

      const mockedStream = new Writable({
        write(chunk, encoding, callback) {
          callback();
        },
      });

      mockedStream.on('finish', () => mockedStream.emit('close'));

      RewireAPI.__Rewire__('fs', {
        createWriteStream: createWriteStreamStub.returns(mockedStream)
      });
      RewireAPI.__Rewire__('archiver', function(type) {
        const archive = archiver(type);
        archiveAppendSpy = sinon.spy(archive, 'append');
        return archive;
      });

      removedRecord.subrecords.push(new MarcRecord());
      preferredRecord.subrecords.push(new MarcRecord());
      mergedRecord.subrecords.push(new MarcRecord());
      unmodifiedMergedRecord.subrecords.push(new MarcRecord());

      return createArchive(username, removedRecord, preferredRecord, mergedRecord, unmodifiedMergedRecord, mergedRecordId);
    });
    afterEach(() => {
      RewireAPI.__ResetDependency__('fs');
      RewireAPI.__ResetDependency__('archiver');
    });


    it('adds subrecords of removed record to the archive', () => {
      expect(callsTo(archiveAppendSpy).map(n => n.name)).to.include('removed-subrecords.txt');
    });

    it('adds subrecords of preferred record to the archive', () => {
      expect(callsTo(archiveAppendSpy).map(n => n.name)).to.include('preferred-subrecords.txt');
    });

    it('adds subrecords of merged record to the archive', () => {
      expect(callsTo(archiveAppendSpy).map(n => n.name)).to.include('merged-subrecords.txt');
    });

    it('adds subrecords of merged record to the archive', () => {
      expect(callsTo(archiveAppendSpy).map(n => n.name)).to.include('merged-unmodified-subrecords.txt');
    });

  });

});


function metadataCall(archiveAppendSpy) {
  return _.head(callsTo(archiveAppendSpy).filter(args => args.name == 'meta.json'));
}

function callsTo(archiveAppendSpy) {
  return _.range(0,archiveAppendSpy.callCount).map(key => {
    return {
      data: archiveAppendSpy.getCall(key).args[0],
      name: archiveAppendSpy.getCall(key).args[1].name
    };
  });
}
