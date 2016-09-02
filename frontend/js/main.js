import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { BaseComponent } from './components/base-component';
import { SigninFormPanelContainer } from './components/signin-form-panel';

import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { createStore, applyMiddleware } from 'redux';
import rootReducer from './root-reducer';
import {Provider} from 'react-redux';
import {Router, Route, hashHistory} from 'react-router';
import App from './components/app';
import * as Cookies from 'js-cookie';
import { validateSession } from './ui-actions';

const loggerMiddleware = createLogger();

const store = createStore(
  rootReducer,
  applyMiddleware(
    thunkMiddleware,
    loggerMiddleware
  )
);

const routes = (
  <Route component={App}>
    <Route path='/signin' component={SigninFormPanelContainer} />
    <Route path='/' component={BaseComponent} />
  </Route>
);

const rootElement = document.getElementById('app');

ReactDOM.render(
  <Provider store={store}>
    <Router history={hashHistory}>{routes}</Router>
  </Provider>, 
  rootElement
);

const sessionToken = Cookies.get('sessionToken');

store.dispatch(validateSession(sessionToken));