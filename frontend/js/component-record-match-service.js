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

import  { matchDetection } from '@natlibfi/melinda-record-matching';
import createDebugLogger from 'debug';


// Basic detection options, these should be tweaked to work better for subrecords
const options = {detection: {
  'strategy': {
    'type': 'bib',
    'features': [
      'hostComponent',
      'isbn',
      'issn',
      'otherStandardIdentifier',
      'title',
      'authors',
      'recordType',
      'publicationTime',
      'language',
      'bibliographicLevel'
    ]
  } }
};

export function match(recordSet1, recordSet2) {
  const debug = createDebugLogger('@natlibfi/melinda-merge:component-record-match-service');
  const debugData = debug.extend('data');

  debug(`Matching set A (${recordSet1.length} records) to set B (${recordSet2.length} records).`);
  debugData(`Detection options ${JSON.stringify(options.detection)}`);

  const formattedOptions = formatDetectionOptions();
  debugData(`Formatted options ${JSON.stringify(formattedOptions)}`);
  const detect = matchDetection.default({strategy: formattedOptions.detection.strategy});

  const matches = recordSet1.reduce((acc, record) => {
    const {pairs, availableRecords} = acc;

    const matchResult = findMatches(record, availableRecords, detect);
    // debugData(`Match result: ${JSON.stringify(matchResult)}`);

    const sortedMatchResults = matchResult
      .sort((a,b) => b.probability - a.probability)
      .filter(result => result.isMatch === true);

    debugData(`Found matches (${sortedMatchResults.length})`);

    const bestMatch = _.head(sortedMatchResults);
    debug(`Best match for ${getRecordId(record)} (${getSubrecordLabel(record)}): ${getRecordId(bestMatch.candidate)} (${getSubrecordLabel(bestMatch.candidate)}): ${bestMatch.probability}`);

    const bestMatchRecord = _.get(bestMatch, 'candidate');
    // debugData(`Best match record for ${getRecordId(record)}: ${getRecordId(bestMatchRecord)}`);

    pairs.push([record, bestMatchRecord]);

    return {
      pairs,
      availableRecords: _.without(availableRecords, bestMatchRecord)
    };
  }, {pairs: [], availableRecords: recordSet2});

  const recordSet2leftoverRecords = matches.availableRecords;

  matches.pairs = _.concat(matches.pairs, recordSet2leftoverRecords.map(record => [undefined, record]));

  const unmatchedSet1 = matches.pairs.filter(pair => pair[1] === undefined);
  const unmatchedSet2 = matches.pairs.filter(pair => pair[0] === undefined);
  const unmatched = matches.pairs.filter(pair => pair[0] === undefined || pair[1] === undefined);

  debug(`Pairs: ${matches.pairs.length}, matched: ${matches.pairs.length-unmatched.length}, unmatched: ${unmatched.length} (unmatched set1: ${unmatchedSet1.length}, unmatched set2: ${unmatchedSet2.length})`);

  const matchList = matches.pairs.map(pair => {
    return [getRecordId(pair[0]), getRecordId(pair[1])];
  });

  debugData(`Pairs: ${JSON.stringify(matchList)}`);

  const matchLabels = matches.pairs.map(pair => {
    return [getSubrecordLabel(pair[0]), getSubrecordLabel(pair[1])];
  });


  debugData(`Labeled pairs: ${JSON.stringify(matchLabels)}`);

  // here counter for non paired pairs
  return matches.pairs;
}

export function findMatches(record, recordSet, detect) {
  const debug = createDebugLogger('@natlibfi/melinda-merge:component-record-match-service:findMatches');
  const debugData = debug.extend('data');

  debugData(`Detecting matches for ${getRecordId(record)} from ${recordSet.length} records`);

  return recordSet.map(candidate => {
    const detectResult  = detect(record, candidate);
    const isMatch = detectResult.match;
    const probability = detectResult.probability;

    debugData(`Match results (${getRecordId(record)} vs  ${getRecordId(candidate)}): ${isMatch} ${probability}`);
    return {
      candidate, isMatch, probability
    };
  });
}

function formatDetectionOptions() {
  const contextFeatures = matchDetection.features[options.detection.strategy.type];

  return {
    ...options,
    detection: {
      ...options.detect,
      strategy: options.detection.strategy.features.map(v => contextFeatures[v]())
    }
  };
}

function getRecordId(record) {
  if (record) {
    const [field] = record.get(/^001$/u);
    return field ? field.value : '';
  }
  return '';
}

function getSubrecordLabel(record) {
  if (record) {
    const titleAValues = record.get(/^245$/u)
      .map(({subfields}) => subfields)
      .flat()
      .filter(({code}) => code === 'a' || code === 'b')
      .map(({value}) => value);

    const locationValues = record.get(/^245$/u)
      .map(({subfields}) => subfields)
      .flat()
      .filter(({code}) => code === 'g' || code === 'q')
      .map(({value}) => value);

    const label=titleAValues.join(' ')+' '+locationValues.join(' ');

    return label ? label.trim() : '';
  }
  return '';
}

