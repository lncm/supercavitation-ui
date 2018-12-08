import React, { Component } from 'react';
import { Callout, InputGroup } from '@blueprintjs/core';


export default class InvoiceExistingInput extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.onPaste = this.onPaste.bind(this);
  }
  onPaste({ target: { value: preImageHash } }) {
    this.props.onPaste(preImageHash);
  }
  render() {
    const { preImageHash } = this.state;
    return (
      <Callout title="Settle Existing Swap" icon="automatic-updates">
        Paste the <b>preImageHash</b> of an existing swap:
        <InputGroup
          large
          leftIcon="code"
          onChange={this.onPaste}
          placeholder="Pase preImageHash"
          value={preImageHash || ''}
        />
      </Callout>
    );
  }
}
