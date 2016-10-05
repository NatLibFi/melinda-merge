import React from 'react';
import classNames from 'classnames';

export class SubrecordMergePanelNewRow extends React.Component {

  static propTypes = {
    onClick: React.PropTypes.func.isRequired,
  }

  render() {

    const classes = classNames('add-new-row');

    return <tr className={classes} onClick={() => this.props.onClick()} />;
  }
}
