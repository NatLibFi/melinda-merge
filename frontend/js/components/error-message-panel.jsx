import React from 'react';
import '../../styles/components/error-message-panel.scss';

export class ErrorMessagePanel extends React.Component {

  static propTypes = {
    message: React.PropTypes.string.isRequired
  }

  render() {
    return (

      <div className="card-panel red lighten-4 error-message-panel">
        <p>{this.props.message}</p>
      </div>

      );
  }
}
