'use strict';
import { logger } from './logger';
import _ from 'lodash';

export function readEnvironmentVariable(name, defaultValue) {

  if (process.env[name] === undefined) {
    if (defaultValue === undefined) {
      const message = `Mandatory environment variable missing: ${name}`;
      logger.log('error', message);
      throw new Error(message);
    }
    logger.log('info', `No environment variable set for ${name}, using default value: ${defaultValue}`);
  }

  return _.get(process.env, name, defaultValue);
}

const whitelist = ['http://localhost:3000', 'http://localhost:3001', undefined];
export const corsOptions = {
  origin: function(origin, callback) {
    var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
    callback(originIsWhitelisted ? null : 'Bad Request', originIsWhitelisted);
  }
};