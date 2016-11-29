import React from 'react';
import '../../styles/components/error-message-panel.scss';

export class ErrorMessagePanel extends React.Component {

  static propTypes = {
    title: React.PropTypes.string,
    message: React.PropTypes.string,
    messageList: React.PropTypes.array
  }

  renderTitle() {
    return <div className="heading">{this.props.title}</div>;
  }

  renderMessage() {
    return <p>{this.props.message}</p>;
  }

  renderMessageList() {
    return <pre>{this.props.messageList.join('\n')}</pre>;
  }

  render() {
    return (
      <div className="red lighten-2 error-message-panel">
        { this.props.title ? this.renderTitle() : null }
        { this.props.message ? this.renderMessage() : null }
        { this.props.messageList ? this.renderMessageList() : null }
        
      </div>
    );
  }
}
