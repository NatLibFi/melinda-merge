'use strict';
import express from 'express';
import path from 'path';
import { logger, expressWinston } from 'server/logger';
import { readEnvironmentVariable } from 'server/utils';
import { sessionController } from 'server/session-controller';
import { marcIOController } from 'server/marc-io-controller';
import { duplicateDatabaseController } from './duplicate-db-controller';
import { mergeController } from './merge-controller';
import cookieParser from 'cookie-parser';

//const NODE_ENV = readEnvironmentVariable('NODE_ENV', 'dev');
const PORT = readEnvironmentVariable('HTTP_PORT', 3001);

const app = express();

app.use(expressWinston);
app.use(cookieParser());


app.use('/api', marcIOController);
app.use('/session', sessionController);
app.use('/duplicates', duplicateDatabaseController);
app.use('/merge', mergeController);

app.use(express.static(path.resolve(__dirname, 'public')));


const server = app.listen(PORT, () => logger.log('info', `Application started on port ${PORT}`));

server.timeout = 1800000; // Half an hour

