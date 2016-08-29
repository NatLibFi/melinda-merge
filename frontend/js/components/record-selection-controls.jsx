import React from 'react';
import '../../styles/components/record-selection-controls';
import * as uiActionCreators from '../ui-actions';
import {connect} from 'react-redux';
import _ from 'lodash';

export class RecordSelectionControls extends React.Component {

  static propTypes = {
    sourceRecordId: React.PropTypes.String.isRequired,
    fetchSourceRecord: React.PropTypes.func.isRequired,
  }

  constructor() {
    super();
    this.handleChangeDebounced = _.debounce((event) => {
      this.props.fetchSourceRecord(event.target.value);
    }, 500);
  }

  render() {

    return (
      <div className="row row-margin-swap record-selection-controls">
      
        <div className="col s2 offset-s1 input-field">
          <input id="source_record" type="tel" className="validate" onChange={this.handleChange.bind(this)} />
          <label htmlFor="source_record">Poistuva tietue</label>
        </div>
        <div className="col s2 control-swap-horizontal input-field">
          <div>
            <a className="btn-floating waves-effect waves-light blue">
              <i className="material-icons tooltip small" title="Vaihda keskenään">swap_horiz</i>
            </a>
          </div>
        </div>

        <div className="col s2 input-field">
          <input id="target_record" type="tel" className="validate" />
          <label htmlFor="target_record">Säilyvä tietue</label>
        </div>
      
    </div>);
  }

  handleChange(event) {
    event.persist();
    this.handleChangeDebounced(event);
  }
}

function mapStateToProps(state) {
  return {
    sourceRecordId: state.get('sourceRecord').get('id')
  };
}

export const RecordSelectionControlsContainer = connect(
  mapStateToProps,
  uiActionCreators
)(RecordSelectionControls);
