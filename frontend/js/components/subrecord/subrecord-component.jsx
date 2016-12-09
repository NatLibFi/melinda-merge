import React from 'react';
import { SubrecordHeaderContainer } from './subrecord-header';
import { DraggableSubrecordMergePanelContainer } from './subrecord-merge-panel';

export class SubrecordComponent extends React.Component {

  render() {
    return (
      <div>
        <SubrecordHeaderContainer />
        <DraggableSubrecordMergePanelContainer />
     </div>
    );
  }
}

