'use strict';
import express from 'express';
import { logger } from './logger';
import { marcIOController } from './marc-io-controller';
import { readEnvironmentVariable } from './utils';

//const NODE_ENV = readEnvironmentVariable('NODE_ENV', 'dev');
const PORT = readEnvironmentVariable('HTTP_PORT', 3001);

const app = express();

app.use((req, res, next) => {
  const remoteAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  logger.log('info', `Got request from ${remoteAddress}`);
  next();
});

app.get('/err', (req, res) => {
  const error = new Error('What a horrble error');

  logger.log('error', 'Got error', error);

  res.status(500).send(error.message);
});

app.use('/api', marcIOController);

app.use(express.static('public'));

app.listen(PORT, () => logger.log('info', `Application started on port ${PORT}`));

