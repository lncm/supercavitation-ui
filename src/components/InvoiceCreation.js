import React, { Component } from 'react';

import InvoiceProcessing from './InvoiceProcessing';
import InvoiceNewInput from './InvoiceNewInput';
import InvoiceExistingInput from './InvoiceExistingInput';

export default class InvoiceFlow extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.onRequestNewInvoice = this.onRequestNewInvoice.bind(this);
    this.onPasteExistingPreImage = this.onPasteExistingPreImage.bind(this);
  }
  onPasteExistingPreImage(preImageHash) {
    this.setState({ preImageHash, request: true });
  }
  onRequestNewInvoice(requestedAmountInSatoshis) {
    this.setState({ requestedAmountInSatoshis });
  }
  render() {
    const { offline } = this.props;
    const { requestedAmountInSatoshis } = this.state;
    if (requestedAmountInSatoshis) {
      return <InvoiceProcessing {...this.state} {...this.props} />;
    }
    return (
      <div>
        {!offline && <InvoiceNewInput onSubmit={this.onRequestNewInvoice} {...this.state} {...this.props} />}
        <br />
        <InvoiceExistingInput onPaste={this.onPasteExistingPreImage} />
      </div>
    );
  }
}
