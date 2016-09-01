import express from 'express';
import { authProvider } from './melinda-auth-provider';
import { createSessionToken, readSessionToken } from './session-crypt'
import bodyParser from 'body-parser';
import { logger } from './logger';
import _ from 'lodash';

export const sessionController = express();

sessionController.use(bodyParser.json());

sessionController.post('/start', requireBodyParams('username', 'password'), (req, res) => {
  const {username, password} = req.body;

  authProvider.validateCredentials(username, password).then(authResponse => {
    if (authResponse.credentialsValid) {
      const sessionToken = createSessionToken(username, password);
      res.send({sessionToken});
    } else {
      res.status(401).send("Authentication failed");
    }
    
  }).catch(err => {

    logger.log('error', 'Error validating credentials', error);

    res.status(500).send('Internal server error');
    
  });

});

sessionController.post('/validate', (req, res) => {
  const {sessionToken} = req.body;
  try {
    const {username, password} = readSessionToken(sessionToken);
    res.send(username);
  } catch (e) {
    res.sendStatus(500);
  }

});

function validateSessionToken(sessionToken) {
 
  const {username, password} = readSessionToken(sessionToken);

}

function requireBodyParams(...requiredParams) {
  return function _requireBodyParams(req, res, next) {
    const values = requiredParams.map(key => req.body[key]);
    if (_.every(values)) {
      return next();  
    }
    res.sendStatus(400);
  }
}
