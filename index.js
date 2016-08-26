'use strict';
import winston from 'winston';
import express from 'express';
import config from './config.js';
//import _ from 'lodash';

const app = express();

app.get('/', (req, res) => {
  const remoteAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  winston.log('info', `Got request from ${remoteAddress}`);
  res.send('Hello');
});

app.get('/err', (req, res) => {
  const error = new Error('What a horrble error');

  winston.log('error', 'Got error', error);

  res.status(500).send(error.message);
});

app.listen(config.port, () => winston.log('info', `Application started on port ${config.port}`));
