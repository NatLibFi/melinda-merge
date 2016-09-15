import React from 'react';
import * as uiActionCreators from '../ui-actions';
import {connect} from 'react-redux';
import { SubrecordActionTypes } from '../constants';
import classNames from 'classnames';
import { List } from 'immutable';

export class SubrecordActionButton extends React.Component {

  static propTypes = {
    rowIndex: React.PropTypes.number.isRequired,
    changeSubrecordAction: React.PropTypes.func.isRequired,
    selectedActions: React.PropTypes.instanceOf(List),
    isMergeActionAvailable: React.PropTypes.bool,
    isCopyActionAvailable: React.PropTypes.bool
  } 

  componentDidUpdate() {
    window.$ && window.$(this._button).closeFAB();
  }

  selectAction(type) {
    const {rowIndex, changeSubrecordAction} = this.props;

    return function() {
      changeSubrecordAction(rowIndex, type);      
    };
  }

  getIcon(actionType) {

    if (actionType === SubrecordActionTypes.BLOCK) return 'block';
    if (actionType === SubrecordActionTypes.MERGE) return 'queue';
    if (actionType === SubrecordActionTypes.COPY) return 'forward';
    return 'more_vert';
  }

  getColor(actionType) {
    if (actionType === SubrecordActionTypes.BLOCK) return 'red';
    if (actionType === SubrecordActionTypes.MERGE) return 'green';
    if (actionType === SubrecordActionTypes.COPY) return 'blue';
    return 'yellow'; 
  }

  render() {

    const {rowIndex, isMergeActionAvailable, isCopyActionAvailable} = this.props;

    const selectedActionType = this.props.selectedActions.get(rowIndex);

    const color = this.getColor(selectedActionType);
    const selectedIconClasses = classNames('btn-floating', 'btn-small', 'waves-effect', 'waves-light', 'subrecord-action-button', color);

    return (
        <div className="fixed-action-btn click-to-toggle horizontal subrecord-action-button-container" ref={(c) => this._button = c}>
          <a className={selectedIconClasses}>
            <i className="large material-icons">{this.getIcon(selectedActionType)}</i>
          </a>
          <ul className="open-left">
            <li><a onClick={this.selectAction(SubrecordActionTypes.BLOCK)} className="btn-floating red"><i className="material-icons">block</i></a></li>
            { !isMergeActionAvailable ? '' : <li><a onClick={this.selectAction(SubrecordActionTypes.MERGE)} className="btn-floating green"><i className="material-icons">queue</i></a></li>}
            { !isCopyActionAvailable ? '' : <li><a onClick={this.selectAction(SubrecordActionTypes.COPY)} className="btn-floating blue"><i className="material-icons">forward</i></a></li>}
          </ul>
        </div>
      );
  }

}

function mapStateToProps(state) {
  return {
    selectedActions: state.getIn(['subrecordActions'])
  };
}


export const SubrecordActionButtonContainer = connect(
  mapStateToProps,
  uiActionCreators
)(SubrecordActionButton);
