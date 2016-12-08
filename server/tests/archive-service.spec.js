import _ from 'lodash';
import sinon from 'sinon';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import archiver from 'archiver';
import sinonAsPromised from 'sinon-as-promised'; // eslint-disable-line
import { __RewireAPI__ as RewireAPI } from '../archive-service';
import { createArchive } from '../archive-service';
import MarcRecord from 'marc-record-js';
const Writable = require('stream').Writable;

const expect = chai.expect;

chai.use(sinonChai);

describe('Archive service', () => {

  const username = 'test-user';
  
  const removedRecord = {
    record: new MarcRecord({fields: [{ tag: '001', value: '1' }]}),
    subrecords: []
  };
  
  const preferredRecord = {
    record: new MarcRecord({fields: [{ tag: '001', value: '2' }]}),
    subrecords: []
  };
  
  const mergedRecord = {
    record: new MarcRecord({fields: [{ tag: '001', value: '3' }]}),
    subrecords: []
  };

  const unmodifiedMergedRecord = {
    record: new MarcRecord({fields: [{ tag: '001', value: '3' }]}),
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
      expect(callsTo(archiveAppendSpy)).to.include({data: removedRecord.record.toString(), name: 'removed.txt'});
    });

    it('adds preferred record to the archive', () => {
      expect(callsTo(archiveAppendSpy)).to.include({data: preferredRecord.record.toString(), name: 'preferred.txt'});
    });
    
    it('adds merged record to the archive', () => {
      expect(callsTo(archiveAppendSpy)).to.include({data: mergedRecord.record.toString(), name: 'merged.txt'});
    });

    it('adds unmodified merged record to the archive', () => {
      expect(callsTo(archiveAppendSpy)).to.include({data: unmodifiedMergedRecord.record.toString(), name: 'merged-unmodified.txt'});
    });

    it('does not add subrecords of removed record to the archive', () => {
      expect(callsTo(archiveAppendSpy).map(n => n.name)).not.to.include('removed-subrecords.txt');
    });

    it('adds metadata to the archive', () => {
      const metadata = JSON.parse(metadataCall(archiveAppendSpy).data);
      expect(metadata.date).to.not.be.undefined;
      delete(metadata.date);

      expect(metadata).to.eql({
        username,
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