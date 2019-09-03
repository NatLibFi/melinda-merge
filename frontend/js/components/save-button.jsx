import React from 'react';
import PropTypes from 'prop-types';
import { commitMerge} from '../ui-actions';
import { connect } from 'react-redux';
import { mergeButtonEnabled } from '../selectors/merge-status-selector';
import { removeSession } from 'commons/action-creators/session-actions';
import classNames from 'classnames';

const SaveButton = (props) => {
  const btnGroupClasses = classNames(
    'btn-floating-extended', 
    'btn-large', 
    'click-to-toggle',
    {
      'disabled': !props.mergeButtonEnabled
    }
  );
  return(
    <div className="fixed-action-btn mt-btn-position">
      <a 
        className={btnGroupClasses}
        onClick={props.commitMerge}
        name="commit_merge">
        <i className="large material-icons">call_merge</i>
        &nbsp;Yhdistä
      </a>
    </div>
  );
};

SaveButton.propTypes = {
  mergeButtonEnabled: PropTypes.bool,
  commitMerge: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return {
    mergeButtonEnabled: mergeButtonEnabled(state),
    mergeStatus: state.getIn(['mergeStatus', 'status']),
    statusInfo: state.getIn(['mergeStatus', 'message'])
  };
}

export default connect(
  mapStateToProps,
  { removeSession, commitMerge }
)(SaveButton);