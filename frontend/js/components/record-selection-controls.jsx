import React from 'react';
import '../../styles/components/record-selection-controls';
import * as uiActionCreators from '../ui-actions';
import {connect} from 'react-redux';
import _ from 'lodash';
import {hashHistory} from 'react-router';
import classNames from 'classnames';
import { hostRecordActionsEnabled } from '../selectors/merge-status-selector';

const RECORD_LOADING_DELAY = 500;

export class RecordSelectionControls extends React.Component {

  static propTypes = {
    sourceRecordId: React.PropTypes.string.isRequired,
    targetRecordId: React.PropTypes.string.isRequired,
    fetchRecord: React.PropTypes.func.isRequired,
    swapRecords: React.PropTypes.func.isRequired,
    setSourceRecordId: React.PropTypes.func.isRequired,
    setTargetRecordId: React.PropTypes.func.isRequired,
    locationDidChange: React.PropTypes.func.isRequired,
    controlsEnabled: React.PropTypes.bool.isRequired
  }

  constructor() {
    super();
    this.handleSourceChangeDebounced = _.debounce((event) => {
      this.props.fetchRecord(event.target.value, 'SOURCE');
    }, RECORD_LOADING_DELAY);

    this.handleTargetChangeDebounced = _.debounce((event) => {
      this.props.fetchRecord(event.target.value, 'TARGET');
    }, RECORD_LOADING_DELAY);
  }

  componentWillMount() {
    const unlisten = hashHistory.listen(location => this.props.locationDidChange(location));
    this.setState({ unlisten });
  }

  componentWillReceiveProps(next) {

    if (_.identity(next.targetRecordId) || _.identity(next.sourceRecordId)) {
      hashHistory.push(`/records/${next.sourceRecordId}/and/${next.targetRecordId}`);
    }
  }

  componentDidUpdate() {
    // update text fields if they are prefilled.
    window.Materialize && window.Materialize.updateTextFields();
  }

  componentWillUnmount() {
    if (typeof this.state.unlisten == 'function') {
      this.state.unlisten();
    }
  }

  handleChange(event) {
    const { controlsEnabled } = this.props;
    if (!controlsEnabled) {
      return;
    }

    event.persist();
    
    if (event.target.id === 'source_record') {
      this.props.setSourceRecordId(event.target.value);
      this.handleSourceChangeDebounced(event);
    }
    if (event.target.id === 'target_record') {
      this.props.setTargetRecordId(event.target.value);
      this.handleTargetChangeDebounced(event);
    }
  }

  handleSwap() {
    const { controlsEnabled } = this.props;

    if (controlsEnabled) {
      this.props.swapRecords();
    }

  }

  render() {

    const { controlsEnabled } = this.props;

    const swapButtonClasses = classNames('btn-floating', 'blue', {
      'waves-effect': controlsEnabled,
      'waves-light': controlsEnabled,
      'disabled': !controlsEnabled
    });

    return (
      <div className="row row-margin-swap record-selection-controls">
      
        <div className="col s2 offset-s1 input-field">
          <input id="source_record" type="tel" value={this.props.sourceRecordId} onChange={this.handleChange.bind(this)} disabled={!controlsEnabled} />
          <label htmlFor="source_record">Poistuva tietue</label>
        </div>
        <div className="col s2 control-swap-horizontal input-field">
          <div>
            <a className={swapButtonClasses} onClick={(e) => this.handleSwap(e)}>
              <i className="material-icons tooltip small" title="Vaihda keskenään">swap_horiz</i>
            </a>
          </div>
        </div>

        <div className="col s2 input-field">
          <input id="target_record" type="tel" value={this.props.targetRecordId} onChange={this.handleChange.bind(this)} disabled={!controlsEnabled}/>
          <label htmlFor="target_record">Säilyvä tietue</label>
        </div>
      
    </div>);
  }

}

function mapStateToProps(state) {
  return {
    sourceRecordId: state.getIn(['sourceRecord', 'id']) || '',
    targetRecordId: state.getIn(['targetRecord', 'id']) || '',
    controlsEnabled: hostRecordActionsEnabled(state)
  };
}

export const RecordSelectionControlsContainer = connect(
  mapStateToProps,
  uiActionCreators
)(RecordSelectionControls);
