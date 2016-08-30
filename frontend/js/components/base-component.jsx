import React from 'react';
import '../../styles/main.scss';
import { NavBar } from './navbar';
import { RecordSelectionControlsContainer } from './record-selection-controls';
import { RecordMergePanelContainer } from './record-merge-panel';
import { HelloMessage } from './hello';

export class BaseComponent extends React.Component {

  render() {
    return (
      <div>
        <NavBar name="test"/>
        <RecordSelectionControlsContainer />
        <RecordMergePanelContainer />
        <HelloMessage name="world" />
      </div>
    );
  }
}
