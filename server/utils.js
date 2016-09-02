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
