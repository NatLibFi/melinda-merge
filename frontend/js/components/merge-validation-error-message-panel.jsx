import React from 'react';
import { ErrorMessagePanel } from './error-message-panel';

export class MergeValidationErrorMessagePanel extends React.Component {

  static propTypes = {
    error: React.PropTypes.instanceOf(Error)
  }

  render() {
    const title = this.props.error.message;
    const messageList = this.props.error.failureMessages;

    return <ErrorMessagePanel title={title} messageList={messageList} />;
  }
}
