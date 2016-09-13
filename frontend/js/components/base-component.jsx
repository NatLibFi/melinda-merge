import React from 'react';
import '../../styles/main.scss';
import { NavBarContainer } from './navbar';
import { RecordSelectionControlsContainer } from './record-selection-controls';
import { RecordMergePanelContainer } from './record-merge-panel';

export class BaseComponent extends React.Component {

  render() {
    return (
      <div>
        <NavBarContainer />
        <RecordSelectionControlsContainer />
        <RecordMergePanelContainer />
      </div>
    );
  }
}
