import React from 'react';
import * as uiActionCreators from '../ui-actions';
import {connect} from 'react-redux';
//import '../../styles/components/subrecord-header.scss';

export class SubrecordHeader extends React.Component {

  render() {
    return (
      
      <div className="row subrecord-header">
        <div className="col s4">

          <div className="row">

            <div className="col s4"><h5>Osakohteet</h5></div>
            <div className="col s4 right">
               <select>
                <option value="" disabled selected>Järjestä</option>
                <option value="1">id</option>
                <option value="2">nimi</option>
                <option value="3">muu</option>
              </select>

            </div>
          </div>
        </div>

        <div className="col s4">
          <div className="row">
            <div className="col s4 right">
          
              <select>
                <option value="" disabled selected>Järjestä</option>
                <option value="1">id</option>
                <option value="2">nimi</option>
                <option value="3">muu</option>
              </select>

            </div>
          </div>
        </div>
        <div className="col s4">

         
        </div>
      </div>

    );
  }
}

function mapStateToProps(state) {
  return {

  };
}

export const SubrecordHeaderContainer = connect(
  mapStateToProps,
  uiActionCreators
)(SubrecordHeader);



