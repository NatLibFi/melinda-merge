import React from 'react';
import '../../styles/main.scss';
import { NavBar } from './navbar';
import { RecordSelectionControlsContainer } from './record-selection-controls';
import { RecordMergePanel } from './record-merge-panel';
import { HelloMessage } from './hello';

export class BaseComponent extends React.Component {

  render() {
    return (
      <div>
        <NavBar name="test"/>
        <RecordSelectionControlsContainer />
        <RecordMergePanel />
        <HelloMessage name="world" />
      </div>
    );
  }
}
