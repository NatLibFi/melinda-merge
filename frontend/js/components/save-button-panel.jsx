import React from 'react';
import '../../styles/components/save-button-panel.scss';
import classNames from 'classnames';
import { Preloader } from 'commons/components/preloader';

export class SaveButtonPanel extends React.Component {

  static propTypes = {
    enabled: React.PropTypes.bool.isRequired,
    error: React.PropTypes.object,
    status: React.PropTypes.string.isRequired,
    onSubmit: React.PropTypes.func.isRequired
  }

  handleClick(event) {
    event.preventDefault();
    const {enabled} = this.props;

    if (enabled) {
      this.props.onSubmit();  
    }
  }

  renderMessages() {
    const {error, status} = this.props;

    if (error !== undefined) {
      return (<span className="save-status save-status-error valign">{error.message}</span>);
    }
    if (status === 'UPDATE_SUCCESS') {
      return (<span className="save-status save-status-success valign">Tietue on tallennettu</span>); 
    }
    return null;
  }

  render() {

    const {enabled, status} = this.props;

    const showPreloader = status === 'UPDATE_ONGOING';

    const buttonClasses = classNames('valign', {
      'disabled': !enabled
    });

    return (
      <div className="save-button-panel valign-wrapper">
        <a href="#" className={buttonClasses} onClick={(e) => this.handleClick(e)}>TALLENNA</a>
        
        {showPreloader ? <Preloader size="small" /> : this.renderMessages()}     
        
      </div>
    );
  }
}
