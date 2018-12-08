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
    this.setState({ requestedAmountInSatoshis, request: true });
  }
  render() {
    const { offline } = this.props;
    const { request } = this.state;
    if (request) {
      return <InvoiceProcessing {...this.state} {...this.props} />;
    }
    return (
      <div className="sections">
        <div>
          {!offline && <InvoiceNewInput onSubmit={this.onRequestNewInvoice} {...this.state} {...this.props} />}
        </div>
        <div>
          <InvoiceExistingInput onPaste={this.onPasteExistingPreImage} />
        </div>
      </div>
    );
  }
}
