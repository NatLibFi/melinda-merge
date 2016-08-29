import React from 'react';

export class HelloMessage extends React.Component {

  static propTypes = {
    name: React.PropTypes.string.isRequired
  };

  render() {
    return <div>Hello {this.props.name}</div>;
  }
}