import React from 'react';

export class DuplicateDatabaseControls extends React.Component {

  static propTypes = {
    loadNextPair: React.PropTypes.func.isRequired,
    skipPair: React.PropTypes.func.isRequired,
    notDuplicate: React.PropTypes.func.isRequired,
    duplicatePairCount: React.PropTypes.number.isRequired
  }

  loadNextDuplicatePair(event) {
    event.preventDefault();
    this.props.loadNextPair(event);
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

  render() {

    return (
      <div className="group">
        <ul id="nav">
          
          <li><a href="#" onClick={(e) => this.loadNextDuplicatePair(e)}><i className="material-icons tooltip" title="Seuraava pari">navigate_next</i></a></li>
          <li><a href="#" onClick={(e) => this.skipCurrentDuplicatePair(e)}><i className="material-icons tooltip" title="Ohita">skip_next</i></a></li>
          <li><a href="#" onClick={(e) => this.markAsNonDuplicate(e)}><i className="material-icons tooltip" title="Ei tupla">layers_clear</i></a></li>
          
        </ul>
        <span className="group-label">Tuplatietokanta {this.renderDuplicateCountBadge()}</span>
      </div>
    );
  }
}

