import React from 'react';
import '../../styles/components/record-selection-controls';
import * as uiActionCreators from '../ui-actions';
import {connect} from 'react-redux';
import _ from 'lodash';
import {hashHistory} from 'react-router';

export class RecordSelectionControls extends React.Component {

  static propTypes = {
    sourceRecordId: React.PropTypes.string.isRequired,
    targetRecordId: React.PropTypes.string.isRequired,
    fetchRecord: React.PropTypes.func.isRequired,
    swapRecords: React.PropTypes.func.isRequired,
    setSourceRecordId: React.PropTypes.func.isRequired,
    setTargetRecordId: React.PropTypes.func.isRequired
  }

  constructor() {
    super();
    this.handleSourceChangeDebounced = _.debounce((event) => {
      this.props.fetchRecord(event.target.value, 'SOURCE');
    }, 500);

    this.handleTargetChangeDebounced = _.debounce((event) => {
      this.props.fetchRecord(event.target.value, 'TARGET');
    }, 500);
  }

  componentWillReceiveProps(next) {
    if (this.props.targetRecordId !== undefined && this.props.sourceRecordId !== undefined) {
      hashHistory.push(`/records/${next.sourceRecordId}/and/${next.targetRecordId}`);
    }
  }

  handleChange(event) {
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

  render() {

    return (
      <div className="row row-margin-swap record-selection-controls">
      
        <div className="col s2 offset-s1 input-field">
          <input id="source_record" type="tel" className="validate" value={this.props.sourceRecordId} onChange={this.handleChange.bind(this)} />
          <label htmlFor="source_record">Poistuva tietue</label>
        </div>
        <div className="col s2 control-swap-horizontal input-field">
          <div>
            <a className="btn-floating waves-effect waves-light blue" onClick={this.props.swapRecords}>
              <i className="material-icons tooltip small" title="Vaihda keskenään">swap_horiz</i>
            </a>
          </div>
        </div>

        <div className="col s2 input-field">
          <input id="target_record" type="tel" className="validate" value={this.props.targetRecordId} onChange={this.handleChange.bind(this)} />
          <label htmlFor="target_record">Säilyvä tietue</label>
        </div>
      
    </div>);
  }

}

function mapStateToProps(state) {
  return {
    sourceRecordId: state.getIn(['sourceRecord', 'id']) || '',
    targetRecordId: state.getIn(['targetRecord', 'id']) || ''
  };
}

export const RecordSelectionControlsContainer = connect(
  mapStateToProps,
  uiActionCreators
)(RecordSelectionControls);
