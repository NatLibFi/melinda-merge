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

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import HttpStatus from 'http-status-codes';
import { corsOptions, requireBodyParams } from 'server/utils';
import { logger } from 'server/logger';
import { readSessionMiddleware, requireSession } from 'server/session-controller';

import { getDuplicateCount, getNextDuplicatePair, markDuplicatePairAsMerged, skipPair, markPairAsNotDuplicates } from './duplicate-db-service';

export const duplicateDatabaseController = express();

duplicateDatabaseController.use(bodyParser.json());
duplicateDatabaseController.use(readSessionMiddleware);
duplicateDatabaseController.set('etag', false);

duplicateDatabaseController.options('/pairs/count', cors(corsOptions)); // enable pre-flight
duplicateDatabaseController.options('/pairs/next', cors(corsOptions)); // enable pre-flight
duplicateDatabaseController.options('/pairs/:id/mark-as-merged', cors(corsOptions)); // enable pre-flight
duplicateDatabaseController.options('/pairs/:id/mark-as-skipped', cors(corsOptions)); // enable pre-flight
duplicateDatabaseController.options('/pairs/:id/mark-as-not-duplicates', cors(corsOptions)); // enable pre-flight

duplicateDatabaseController.get('/pairs/count', cors(corsOptions), (req, res) => {

  getDuplicateCount()
    .then(count => res.send(count))
    .catch(error => {
      logger.log('error', error);
      res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    });

});

duplicateDatabaseController.get('/pairs/next', cors(corsOptions), requireSession, (req, res) => {
  const {username} = req.session;

  getNextDuplicatePair(username)
    .then(pair => res.send(pair))
    .catch(error => {
      logger.log('error', error);
      res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    });

});

duplicateDatabaseController.put('/pairs/:id/mark-as-merged', cors(corsOptions), requireSession, requireBodyParams('preferredRecordId', 'otherRecordId', 'mergedRecordId'), (req, res) => {
  const {username} = req.session;
  const duplicatePairId = req.params.id;
  const {preferredRecordId, otherRecordId, mergedRecordId} = req.body;

  markDuplicatePairAsMerged(username, preferredRecordId, otherRecordId, mergedRecordId, duplicatePairId)
    .then(pair => res.send(pair))
    .catch(error => {
      logger.log('error', error);
      res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    });

});

duplicateDatabaseController.put('/pairs/:id/mark-as-skipped', cors(corsOptions), requireSession, (req, res) => {
  const {username} = req.session;
  const duplicatePairId = req.params.id;

  skipPair(username, duplicatePairId)
    .then(pair => res.send(pair))
    .catch(error => {
      logger.log('error', error);
      res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    });

});


duplicateDatabaseController.put('/pairs/:id/mark-as-not-duplicates', cors(corsOptions), requireSession, (req, res) => {
  const {username} = req.session;
  const duplicatePairId = req.params.id;

  markPairAsNotDuplicates(username, duplicatePairId)
    .then(pair => res.send(pair))
    .catch(error => {
      logger.log('error', error);
      res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    });

});

