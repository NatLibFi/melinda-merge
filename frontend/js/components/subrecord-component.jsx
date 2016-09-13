import React from 'react';
import * as uiActionCreators from '../ui-actions';
import {connect} from 'react-redux';
import { SubrecordHeader } from './subrecord-header';
import { SubrecordMergePanelContainer } from './subrecord-merge-panel';


export class SubrecordComponent extends React.Component {

  render() {
    return (
      <div>
        <SubrecordHeader />
        <SubrecordMergePanelContainer />
     </div>
    );
  }
}
