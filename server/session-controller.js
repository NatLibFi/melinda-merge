import express from 'express';
import cors from 'cors';
import { authProvider } from './melinda-auth-provider';
import { createSessionToken, readSessionToken } from './session-crypt';
import bodyParser from 'body-parser';
import { logger } from './logger';
import _ from 'lodash';
import { corsOptions } from './utils';

export const sessionController = express();

sessionController.use(bodyParser.json());

sessionController.options('/start', cors(corsOptions)); // enable pre-flight
sessionController.post('/start', cors(corsOptions), requireBodyParams('username', 'password'), (req, res) => {
  const {username, password} = req.body;

  logger.log('info', `Checking credentials for user ${username}`);

  authProvider.validateCredentials(username, password).then(authResponse => {
    if (authResponse.credentialsValid) {
      const sessionToken = createSessionToken(username, password);
      res.send({sessionToken});
      logger.log('info', `Succesful signin from ${username}`);
    } else {
      logger.log('info', `Credentials not valid for user ${username}`);
      res.status(401).send('Authentication failed');
    }
    
  }).catch(error => {

    logger.log('error', 'Error validating credentials', error);

    res.status(500).send('Internal server error');
    
  });
});

sessionController.post('/validate', (req, res) => {
  const {sessionToken} = req.body;
  try {
    const {username} = readSessionToken(sessionToken);
    res.send(username);
  } catch (e) {
    res.sendStatus(500);
  }

});

function requireBodyParams(...requiredParams) {
  return function _requireBodyParams(req, res, next) {
    const values = requiredParams.map(key => req.body[key]);
    if (_.every(values)) {
      return next();  
    }
    res.sendStatus(400);
  };
}
