import winston from 'winston';

const LOGLEVEL = process.env.NODE_ENV == 'debug' ? 'debug' : 'info';

export const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      'timestamp':true, 
      'level': LOGLEVEL
    })
  ]
});
