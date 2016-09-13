import React from 'react';
import * as uiActionCreators from '../ui-actions';
import {connect} from 'react-redux';
import { SubRecordPanel } from './subrecord-panel';
import _ from 'lodash';

import '../../styles/components/subrecord-merge-panel.scss';

export class SubrecordMergePanel extends React.Component {

  static propTypes = {
    sourceSubrecords: React.PropTypes.array.isRequired,
    targetSubrecords: React.PropTypes.array.isRequired
  }

  renderSubrecordPanel(record) {

    if (record) {
      return (
        <div className="card-panel darken-1 marc-record">
          <SubRecordPanel record={record} />
        </div>
      );
    } else {
      return '';
    }
  }

  render() {
    return (
      
      <table className="bordered subrecord-merge-panel">
        <tbody>
        { 
          _.zip(this.props.sourceSubrecords, this.props.targetSubrecords).map(([sourceRecord, targetRecord]) => {

            const key = createKey(sourceRecord, targetRecord);
   
            return (
              <tr key={key}>
                <td>
                  {this.renderSubrecordPanel(sourceRecord)}
                </td>
                <td>
                  {this.renderSubrecordPanel(targetRecord)}
                </td>
                <td>
                  <a className="btn-floating btn-small waves-effect waves-light yellow merge-action-button">
                    <i className="material-icons">more_vert</i>
                  </a>

                </td>

              </tr>

            );
          })

        }
      </tbody>
      </table>

    );
  }
}

function createKey(sourceRecord, targetRecord) {

  const s = _.get(sourceRecord, 'fields', []).filter(f => f.tag === '001').map(f => f.value);
  const t = _.get(targetRecord, 'fields', []).filter(f => f.tag === '001').map(f => f.value);

  return `${s}-${t}`;
}

function mapStateToProps(state) {
  return {
    sourceSubrecords: state.getIn(['sourceRecord', 'subrecords'], []),
    targetSubrecords: state.getIn(['targetRecord', 'subrecords'], [])
  };
}

export const SubrecordMergePanelContainer = connect(
  mapStateToProps,
  uiActionCreators
)(SubrecordMergePanel);
