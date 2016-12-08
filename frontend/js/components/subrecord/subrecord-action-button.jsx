import React from 'react';
import * as subrecordActions from '../../action-creators/subrecord-actions';
import {connect} from 'react-redux';
import { SubrecordActionTypes } from '../../constants';
import classNames from 'classnames';

export class SubrecordActionButton extends React.Component {

  static propTypes = {
    rowId: React.PropTypes.string.isRequired,
    changeSubrecordAction: React.PropTypes.func.isRequired,
    selectedAction: React.PropTypes.string,
    isMergeActionAvailable: React.PropTypes.bool,
    isCopyActionAvailable: React.PropTypes.bool,
    actionsEnabled: React.PropTypes.bool
  } 

  componentDidUpdate() {
    window.$ && window.$(this._button).closeFAB();  
  }

  selectAction(type) {
    const {rowId, changeSubrecordAction} = this.props;

    return () => {
      if (this.props.actionsEnabled) {
        changeSubrecordAction(rowId, type);
      }
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

  renderButton(color, icon, onClickFn) {
    const buttonClasses = classNames('btn-floating', color);

    return (
      <a className={buttonClasses}
        onClick={onClickFn} >

        <i className="material-icons">{icon}</i>
      </a>
    );
  }

  renderActionButton(actionType) {
    const color = this.getColor(actionType);
    const icon = this.getIcon(actionType);

    return this.renderButton(color, icon, this.selectAction(actionType));
  }

  renderUnsetButton() {
    return this.renderButton('yellow', 'more_vert', this.selectAction(SubrecordActionTypes.UNSET));
  }

  renderBlockButton() {
    return this.renderButton('red', 'block', this.selectAction(SubrecordActionTypes.BLOCK));
  }

  renderMergeButton() {
    return this.renderButton('green', 'queue', this.selectAction(SubrecordActionTypes.MERGE));
  }

  renderCopyButton() {
    return this.renderButton('blue', 'forward', this.selectAction(SubrecordActionTypes.COPY));
  }

  isActionAvailable(actionType) {
    const {isMergeActionAvailable, isCopyActionAvailable} = this.props;
    if (actionType === SubrecordActionTypes.COPY) return isCopyActionAvailable;
    if (actionType === SubrecordActionTypes.MERGE) return isMergeActionAvailable;
    return true;
  }

  render() {

    const {selectedAction, actionsEnabled} = this.props;

    const {UNSET, BLOCK, MERGE, COPY} = SubrecordActionTypes;

    const buttons = [BLOCK, MERGE, COPY]
      .filter(actionType => this.isActionAvailable(actionType))
      .map(actionType => actionType === selectedAction ? UNSET : actionType)
      .map(actionType => <li key={actionType}>{this.renderActionButton(actionType)}</li>);
   
    const color = this.getColor(selectedAction);
    const selectedIconClasses = classNames('btn-floating', 'btn-small', 'waves-light', 'subrecord-action-button', color, {
      'disabled': !actionsEnabled,
      'waves-effect': actionsEnabled
    });

    const containerClasses = classNames('subrecord-action-button-container', {
      'fixed-action-btn': actionsEnabled,
      'click-to-toggle': actionsEnabled,
      'horizontal': actionsEnabled
    });

    return (
      <div className={containerClasses} ref={(c) => this._button = c}>
        <a className={selectedIconClasses}>
          <i className="large material-icons">{this.getIcon(selectedAction)}</i>
        </a>

        {actionsEnabled ? <ul className="open-left">{ buttons }</ul> : null}

      </div>
    );
  }
}

export const SubrecordActionButtonContainer = connect(
  null,
  subrecordActions
)(SubrecordActionButton);
