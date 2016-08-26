import React from 'react';
import ReactDOM from 'react-dom';
import '../styles/main.scss';

const rootElement = document.getElementById('app');

class HelloMessage extends React.Component {

  static propTypes = {
    name: React.PropTypes.string.isRequired
  };

  render() {
    return <div>Hello {this.props.name}</div>;
  }
}

ReactDOM.render(<HelloMessage name="world" />, rootElement);
