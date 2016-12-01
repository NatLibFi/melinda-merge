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

