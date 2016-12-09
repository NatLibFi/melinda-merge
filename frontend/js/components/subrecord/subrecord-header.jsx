import React from 'react';
import { setCompactSubrecordView } from '../../ui-actions';
import {connect} from 'react-redux';

export class SubrecordHeader extends React.Component {

  static propTypes = {
    setCompactSubrecordView: React.PropTypes.func.isRequired,
    compactSubrecordView: React.PropTypes.bool.isRequired
  }
  
  toggleCompactView(event) {
    const isEnabled = event.target.checked;

    this.props.setCompactSubrecordView(isEnabled);    
  }

  render() {

    return (
      
      <div className="row subrecord-header">
        <div className="col s4">

          <div className="row">

            <div className="col s4"><h5>Osakohteet</h5></div>
           
          </div>
        </div>

        <div className="col s4" />

        <div className="col s4">
          <p>
            <input 
              type="checkbox" 
              id="compact-subrecords-checkbox" 
              value="compact-subrecords-view"
              className="filled-in"
              checked={this.props.compactSubrecordView} 
              onChange={(e) => this.toggleCompactView(e)}
              ref={(c) => this._compactViewCheckBox = c}
            />
            
            <label htmlFor="compact-subrecords-checkbox">Pienennä käsitellyt osakohteet</label>
          </p>
        </div>
      </div>
    );
  }
}


function mapStateToProps(state) {
  return {
    compactSubrecordView: state.getIn(['ui', 'compactSubrecordView'])
  };
}

export const SubrecordHeaderContainer = connect(
  mapStateToProps,
  { setCompactSubrecordView }
)(SubrecordHeader);



