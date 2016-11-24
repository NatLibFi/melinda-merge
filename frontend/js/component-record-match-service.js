import _ from 'lodash';
import jsonSimilarity from 'json-similarity';
import similarityDefinition from './similarity-definition';

export function match(recordSet1, recordSet2) {

  const matches = recordSet1.reduce((acc, record) => {
    const {pairs, availableRecords} = acc;

    const matchResult = findMatches(record, availableRecords);

    const sortedMatchResults = matchResult
      .sort((a,b) => b.similarity.points - a.similarity.points)
      .filter(result => result.similarity.match === true);

    const bestMatch = _.head(sortedMatchResults);

    const bestMatchRecord = _.get(bestMatch, 'candidate');

    pairs.push([record, bestMatchRecord]);

    return {
      pairs,
      availableRecords: _.without(availableRecords, bestMatchRecord)
    };
  }, {pairs: [], availableRecords: recordSet2});

  const recordSet2leftoverRecords = matches.availableRecords;

  matches.pairs = _.concat(matches.pairs, recordSet2leftoverRecords.map(record => [undefined, record]));
  
  return matches.pairs;
}

export function findMatches(record, recordSet) {
  return recordSet.map(candidate => {
    const similarity = calculateSimilarity(record, candidate);
    return {
      candidate, similarity
    };
  });
}

function calculateSimilarity(record1, record2) {
  return jsonSimilarity(record1, record2, similarityDefinition);
}
