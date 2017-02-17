import React from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { CommitMergeStates } from '../constants';
import '../../styles/components/merge-dialog.scss';

export class MergeDialog extends React.Component {
  static propTypes = {
    closable: React.PropTypes.bool.isRequired,
    onClose: React.PropTypes.func.isRequired,
    status: React.PropTypes.string.isRequired,
    message: React.PropTypes.string.isRequired,
    response: React.PropTypes.object
  }

  close(event) {
    event.preventDefault();
    if (this.props.closable) {
      this.props.onClose();
    }
  }

  title() {
    switch(this.props.status) {
      case CommitMergeStates.COMMIT_MERGE_ONGOING: return 'Tietueita yhdistetään';
      case CommitMergeStates.COMMIT_MERGE_ERROR: return 'Virhe tietueiden yhdistämisessä';
      case CommitMergeStates.COMMIT_MERGE_COMPLETE: return 'Tietueet yhdistetty';
    }
    return '';
  }

  renderResponseMessages(response) {
    
    if (_.isEmpty(response)) {
      return <div className="response-container"><div className="red lighten-5">Tuntematon virhe</div></div>;
    }
    
    if (response.name === 'RollbackError') {
      return <div className="response-container"><div className="red lighten-5">{response.message}</div></div>;
    }

    const triggers = response.triggers.filter(usefulMessage).map(this.renderSingleMessage);
    const warnings = response.warnings.filter(usefulMessage).map(this.renderSingleMessage);
    const errors = response.errors.map(this.renderSingleMessage);
    const messages = response.messages.map(this.renderSingleMessage);

    return (
      <div className="response-container">
        {messages.length ? <div className="green lighten-4">{messages}</div> : null}
        {errors.length   ? <div className="red lighten-5">{errors}</div> : null}
        {warnings.length ? <div className="lime lighten-4">{warnings}</div> : null}
        {triggers.length ? <div className="light-blue lighten-5">{triggers}</div> : null}
      </div>
    );

    function usefulMessage(message) {
      return message.code !== '0121' && message.code !== '0101';
    }
  }

  renderSingleMessage(item, i) {
    return (
      <div key={`${item.message}-${i}`} className="message-container"><span className="code">{item.code}</span><span className="message">{item.message}</span></div>
    );
  }

  renderContent() {

    if (this.props.response) {
      return this.renderResponseMessages(this.props.response);
    } else if (this.props.status === CommitMergeStates.COMMIT_MERGE_ONGOING) {
      return <div>{this.renderSpinner()}</div>;
    } else {
      return <p>{this.props.message}</p>;
    }
  }

  renderSpinner() {
    return (
      <div className="preloader-wrapper small active">
        <div className="spinner-layer spinner-blue-only">
          <div className="circle-clipper left">
            <div className="circle" />
          </div>
          <div className="gap-patch">
            <div className="circle" />
          </div>
          <div className="circle-clipper right">
            <div className="circle" />
          </div>
        </div>
      </div>
    );
  }

  render() {

    const buttonClasses = classNames({
      disabled: !this.props.closable
    });

    return (
      <div className="row modal-merge-dialog">
        <div className="col offset-s8 s4">
          <div className="card">
            <div className="card-content">
              <span className="card-title">{this.title()}</span>
              {this.renderContent()}
            </div>
            <div className="card-action right-align">
              <a className={buttonClasses} href="#" onClick={(e) => this.close(e)}>Sulje</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
