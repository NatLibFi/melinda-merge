import React from 'react';
import * as uiActionCreators from '../ui-actions';
import {connect} from 'react-redux';
import { SubrecordActionTypes } from '../constants';

export class SubrecordActionButton extends React.Component {

  static propTypes = {
    rowIndex: React.PropTypes.number.isRequired,
    setSubrecordAction: React.PropTypes.func.isRequired,
  } 

  selectAction(type) {
    const {rowIndex, setSubrecordAction} = this.props;

    return function() {
      setSubrecordAction(rowIndex, type);      
    };
  }

  render() {
   
    return (
        <div className="fixed-action-btn click-to-toggle horizontal subrecord-action-button-container">
          <a className="btn-floating btn-small waves-effect waves-light yellow subrecord-action-button">
            <i className="large material-icons">more_vert</i>
          </a>
          <ul className="open-left">
            <li><a onClick={this.selectAction(SubrecordActionTypes.BLOCK)} className="btn-floating red"><i className="material-icons">block</i></a></li>
            <li><a onClick={this.selectAction(SubrecordActionTypes.MERGE)} className="btn-floating green"><i className="material-icons">queue</i></a></li>
            <li><a onClick={this.selectAction(SubrecordActionTypes.COPY)} className="btn-floating blue"><i className="material-icons">forward</i></a></li>
          </ul>
        </div>
      );
  }

}

export const SubrecordActionButtonContainer = connect(
  null,
  uiActionCreators
)(SubrecordActionButton);
