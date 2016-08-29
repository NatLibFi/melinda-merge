import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { BaseComponent } from './components/base-component';

import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import { createStore, applyMiddleware } from 'redux';
import { fetchSourceRecord } from './ui-actions';
import rootReducer from './root-reducer';
import {Provider} from 'react-redux';

const loggerMiddleware = createLogger();

const store = createStore(
  rootReducer,
  applyMiddleware(
    thunkMiddleware,
    loggerMiddleware
  )
);

store.dispatch(fetchSourceRecord('30000'));


const rootElement = document.getElementById('app');

ReactDOM.render(
  <Provider store={store}>
    <BaseComponent />
  </Provider>, rootElement);

