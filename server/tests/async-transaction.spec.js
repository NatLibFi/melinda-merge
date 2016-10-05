/*jshint mocha:true*/
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
var expect = chai.expect;
var assert = chai.assert;

var {executeTransaction, RollbackError} = require('../async-transaction');


describe('transcation', function() {

  it('should run actions and result in OK if all is well', function(done) {

    var sequence = [
      {action: successFn('del1'), rollback: successFn('undel1')},
      {action: successFn('del2'), rollback: successFn('undel2')},
      {action: successFn('merge'), rollback: undefined},
    ];

    executeTransaction(sequence).then(function(res) {
      try {
        assert(true, 'Success callback should be called when everyting is ok');
        expect(res).to.eql(['del1', 'del2', 'merge']);

        done();
      } catch(e) {
        done(e);
      }
    }, function(error) {
      if (error.name == 'AssertionError') {
        done(error);
      }
      done(new Error('Error callback should not be called when everyting is ok'));
    });
  });

  it('should rollback on error and tell what failed', function(done) {

    var sequence = [
      {action: successFn('del1'), rollback: successFn('undel1')},
      {action: successFn('del2'), rollback: successFn('undel2')},
      {action: failingFn('merge'), rollback: undefined},
    ];

    executeTransaction(sequence)
      .then(onFulfilledMustNotBeCalled(done))
      .catch(function(error) {
        if (error.name == 'AssertionError') {
          done(error);
        }
        
        expect(error.message).to.equal('merge');
        done();
      });
  });

  it('should run additional rollbacks', function(done) {

    const additionalRollback = sinon.spy(successFn('extrarollbackaction'));

    var sequence = [
      {action: successFn('del1'), rollback: successFn('undel1')},
      {action: successFn('del2'), rollback: successFn('undel2')},
      {action: failingFn('merge'), rollback: undefined},
    ];

    executeTransaction(sequence, [additionalRollback])
      .then(onFulfilledMustNotBeCalled(done))
      .catch(catchHandler(function(error) {
        expect(additionalRollback).to.have.been.calledOnce;
        expect(error.message).to.equal('merge');
        done();
      }, done));
  });

  it('should give action response to rollback function as parameter', function(done) {

    const rollback1 = sinon.spy(successFn('undel1'));
    const rollback2 = sinon.spy(successFn('undel2'));

    var sequence = [
      {action: successFn('del1'), rollback: rollback1},
      {action: successFn('del2'), rollback: rollback2},
      {action: failingFn('merge'), rollback: undefined},
    ];

    executeTransaction(sequence)
      .then(onFulfilledMustNotBeCalled(done))
      .catch(function(error) {
        if (error.name == 'AssertionError') {
          done(error);
        }

        try {
          expect(rollback1.getCall(0).args).to.eql(['del1']);
          expect(rollback2.getCall(0).args).to.eql(['del2']);          
          expect(error.message).to.equal('merge');
          done();
        } catch(e) {
          done(e);
        }
      });
  });

  it('should stop execution on first error', function(done) {

    var sequence = [
      {action: successFn('del1'), rollback: successFn('undel1')},
      {action: failingFn('del2'), rollback: successFn('undel2')},
      {action: successFn('merge'), rollback: undefined},
    ];

    executeTransaction(sequence)
      .then(onFulfilledMustNotBeCalled(done))
      .catch(function(error) {
        if (error.name == 'AssertionError') {
          done(error);
        }
        
        expect(error.message).to.equal('del2');

        done();
      });
  });


  it('should throw a RollbackError if rollback fails', function(done) {

    var sequence = [
      {action: successFn('del1'), rollback: failingFn('undel1')},
      {action: successFn('del2'), rollback: successFn('undel2')},
      {action: failingFn('merge'), rollback: undefined},
    ];

    executeTransaction(sequence)
      .then(onFulfilledMustNotBeCalled(done))
      .catch(catchHandler(function(error) {
        expect(error).to.be.instanceof(RollbackError);
        expect(error.message).to.equal('undel1');  
        done();
      }, done));
  });
});

function catchHandler(fn, done) {
  return function(error) {
    if (error.name == 'AssertionError') {
      done(error);
    }
    try {
      fn(error);
    } catch(error) {
      done(error);
    }
  };
}


describe('RollbackError', function() {
  it('should be accessible', function() {
    expect(RollbackError).to.be.a('function');
  });
  it('should have default message if message not fiven', function() {
    var rollbackError = new RollbackError();
    expect(rollbackError.message).to.equal('Rollback failed');
  });
});


function successFn(text) {
  return function() {
    return asyncFunc(text);
  };
}

function failingFn(text) {
  return function() {
    return asyncFail(text);
  };
}

function asyncFunc(text) {
  return new Promise((resolve) => {
    setTimeout(function() { resolve(text); }, 5);
  });
}

function asyncFail(text) {
  return new Promise((resolve, reject) => {
    setTimeout(function() { reject(new Error(text)); }, 5);
  });
}

function onFulfilledMustNotBeCalled(done) {
  return (res) => done(new Error('Success callback was run on error case. Result was: ' + res));
}
