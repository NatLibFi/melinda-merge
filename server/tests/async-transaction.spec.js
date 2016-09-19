/*jshint mocha:true*/
'use strict';

var chai = require('chai');
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

    executeTransaction(sequence).then(function() {
      assert(true, 'Success callback should be called when everyting is ok');
      done();
    }).catch(function(error) {
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
      .catch(function(error) {
        if (error.name == 'AssertionError') {
          done(error);
        }

        try {

          expect(error).to.be.instanceof(RollbackError);
          expect(error.message).to.equal('undel1');  
          done();
        } catch(e) {
          done(e);
        }
      });
  });
});

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
