import React from 'react';

export class ErrorMessagePanel extends React.Component {

  static propTypes = {
    message: React.PropTypes.string.isRequired
  }

  render() {
    return (

      <div className="card-panel red darken-1">
        <p>{this.props.message}</p>
      </div>

      );
  }
}
