import React from 'react';
import ReactDOM from 'react-dom';
import '../styles/main.scss';
import { NavBar } from './components/navbar';
import { HelloMessage } from './components/hello';
import { RecordSelectionControls } from './components/record-selection-controls';
import { RecordMergePanel } from './components/record-merge-panel';

const rootElement = document.getElementById('app');

ReactDOM.render(
  <div>
    <NavBar name="test"/>
    <RecordSelectionControls />
    <RecordMergePanel />
    <HelloMessage name="world" />
  </div>, rootElement);

