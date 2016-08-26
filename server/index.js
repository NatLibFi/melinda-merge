'use strict';
import express from 'express';
import _ from 'lodash';
import { logger } from './logger';

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

app.use(express.static('public'));

app.listen(PORT, () => logger.log('info', `Application started on port ${PORT}`));


function readEnvironmentVariable(name, defaultValue) {

  if (process.env[name] === undefined) {
    logger.log('info', `No environment variable set for ${name}, using default value: ${defaultValue}`);
  }

  return _.get(process.env, name, defaultValue);

}