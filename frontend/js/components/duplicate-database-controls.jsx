import React from 'react';
import { DuplicateDatabaseStates } from '../constants';

export class DuplicateDatabaseControls extends React.Component {

  static propTypes = {
    loadNextPair: React.PropTypes.func.isRequired,
    skipPair: React.PropTypes.func.isRequired,
    notDuplicate: React.PropTypes.func.isRequired,
    duplicatePairCount: React.PropTypes.number.isRequired,
    currentStatus: React.PropTypes.string.isRequired
  }

  loadNextDuplicatePair(event) {
    event.preventDefault();
    this.props.loadNextPair();
  }

  skipCurrentDuplicatePair(event) {
    event.preventDefault();
    this.props.skipPair(event);
  }

  markAsNonDuplicate(event) {
    event.preventDefault();
    this.props.notDuplicate(event);
  }

  renderDuplicateCountBadge() {
    const count = this.props.duplicatePairCount;

    return count > 0 ? (<span className="badge tooltip" title="Tuplaehdotukset">{count}</span>) : null;
  }

  renderProgressIndicatorFor(action) {
  
    return this.props.currentStatus === action ? <div className="progress"><div className="indeterminate" /></div> : null;
  }

  render() {

    return (
      <div className="group">
        <ul id="nav">
          
          <li>
            <a href="#" onClick={(e) => this.loadNextDuplicatePair(e)}><i className="material-icons tooltip" title="Seuraava pari">navigate_next</i></a>
            {this.renderProgressIndicatorFor(DuplicateDatabaseStates.FETCH_NEXT_DUPLICATE_ONGOING)}
          </li>
          <li>
            <a href="#" onClick={(e) => this.skipCurrentDuplicatePair(e)}><i className="material-icons tooltip" title="Ohita">skip_next</i></a>
            {this.renderProgressIndicatorFor(DuplicateDatabaseStates.SKIP_PAIR_ONGOING)}
          </li>
          <li>
            <a href="#" onClick={(e) => this.markAsNonDuplicate(e)}><i className="material-icons tooltip" title="Ei tupla">layers_clear</i></a>
            {this.renderProgressIndicatorFor(DuplicateDatabaseStates.MARK_AS_NON_DUPLICATE_ONGOING)}
          </li>
          
        </ul>
        <span className="group-label">Tuplatietokanta {this.renderDuplicateCountBadge()}</span>
      </div>
    );
  }
}

