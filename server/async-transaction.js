
export function executeTransaction(sequence) {

  var rollbacks = [];

  return new Promise((resolve, reject) => {

    var chain = Promise.resolve();
    sequence.forEach(function (transactionStepDefinition) {
      chain = chain.then(step(transactionStepDefinition));
    });

    chain.then(function(lastResult) {
      resolve(lastResult);
    }).catch(function(error) {
      if (error.rollbacks) {
        // do a rollback
      
        executeRollbacks(error.rollbacks)
          .then(() => reject(error)) // error, but rollback was success
          .catch(error => {
            const rollbackError = new RollbackError(error.message);
            reject(rollbackError);
          });
      } else {
        reject(error);
      }
    });
  });

  // transaction step
  function step(fn) {

    return function() {
      var p = fn.action();
    
      p.catch(function(error) {
        //Add rollbackinfo to error
        error.rollbacks = rollbacks;
        throw error;
      });

      p.then(function(result) {
        rollbacks.unshift(fn.rollback);
        return result;
      });
    
      return p;
    };
  }
}

function executeRollbacks(rollbackSequence) {
  
  return new Promise((resolve, reject) => {
    const inital = Promise.resolve();

    rollbackSequence.reduce(function (acc, rollbackFn) {
      return acc.then(rollbackFn).catch(e => reject(e));
    }, inital).then(resolve);
  });
}


export function RollbackError(message) {
  this.name = 'RollbackError';
  this.message = message || 'Rollback failed';
}
RollbackError.prototype = Object.create(Error.prototype);
RollbackError.prototype.constructor = RollbackError;
