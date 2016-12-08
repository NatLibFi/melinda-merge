import React from 'react';
import classNames from 'classnames';

export class SubrecordMergePanelNewRow extends React.Component {

  static propTypes = {
    onClick: React.PropTypes.func.isRequired,
    enabled: React.PropTypes.bool.isRequired
  }

  render() {
    const { enabled } = this.props;
    
    const classes = classNames('add-new-row', {
      'disabled': !enabled
    });

    return <tr className={classes} onClick={() => this.props.onClick()} />;
  }
}
