/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* UI for merging MARC records in Melinda
*
* Copyright (C) 2015-2018 University Of Helsinki (The National Library Of Finland)
*
* This file is part of melinda-merge
*
* melinda-merge program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* melinda-merge is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/

import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { BaseComponentContainer } from './components/base-component';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from './root-reducer';
import {Provider} from 'react-redux';
import {Router,Route} from 'react-router-dom';
import {App} from './components/app';
import * as Cookies from 'js-cookie';
import { validateSession } from 'commons/action-creators/session-actions';
import { initKeyboardListener } from './keyboard-commands';
import history from './history';
import 'material-design-icons-iconfont';

const loggerMiddleware = createLogger();

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  rootReducer,
  composeEnhancers(
    applyMiddleware(
      thunkMiddleware,
      loggerMiddleware
    )
  )
);

const rootElement = document.getElementById('app');

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <App>
        <Route exact path='/' component={BaseComponentContainer} />
        <Route exact path='/records/:otherId/and/:preferredId?' component={BaseComponentContainer} />
      </App>
    </Router>
  </Provider>, 
  rootElement
);

const sessionToken = Cookies.get('sessionToken');

store.dispatch(validateSession(sessionToken));

initKeyboardListener(document, store);
