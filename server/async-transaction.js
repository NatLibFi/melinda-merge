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


export function executeTransaction(sequence, additionalRollbackActions) {

  var additionalRollbacksToRun = additionalRollbackActions || [];

  var rollbacks = [];

  return new Promise((resolve, reject) => {

    var chain;
    const results = [];
    sequence.forEach(function(transactionStepDefinition, i) {
      
      if (i === 0) {
        chain = step(transactionStepDefinition)();
      } else {
        chain = chain.then((result) => {
          results.push(result);
          return step(transactionStepDefinition)();
        });
      }
    });

    chain.then(function(lastResult) {
      results.push(lastResult);
      resolve(results);
    }).catch(function(error) {

      var rollbacksToRun = error.rollbacks || [];
      rollbacksToRun = rollbacksToRun.concat(additionalRollbacksToRun);

      if (rollbacksToRun.length > 0) {
        // do a rollback
      
        executeRollbacks(rollbacksToRun)
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
        rollbacks.unshift(fn.rollback.bind(null, result));
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
      return acc.then(() => rollbackFn()).catch(e => reject(e));
    }, inital).then(resolve);
  });
}


export function RollbackError(message) {
  this.name = 'RollbackError';
  this.message = message || 'Rollback failed';
}
RollbackError.prototype = Object.create(Error.prototype);
RollbackError.prototype.constructor = RollbackError;
