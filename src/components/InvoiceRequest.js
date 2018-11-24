import React, { Component } from 'react';

import { requestInvoice } from '../http';

// 0. Input amount you wish to get...
//
// 1. make request to bob to get invoice, sign the message
// 2. show the deposit payment invoice
// 3. wait for response (tx id)
//
// 4. Repat 1-3 for main invoice
//
// 5. See if bob automatically claims the rewards (timeout
//
// 6. Show UI to claim funds if not

const testProps = {
  spendAmount: '2344',
  request: true,
  contractAddress: '0xef899220a9f3ee569e5b629b655991f8bcebe184',
  httpEndpoint: 'http://localhost:8000',
  owner: '0x0f18cd0F5B7CcE9d6DCC246F80B0fCdd7a2AF150',
  lockedFunds: '0',
  balance: '0',
  text: "Hello, I'm Bob. I would never scam you. Trust me ;).",
  minAmount: 1000,
  timeLockNumber: 30,
  depositFee: 50,
  exchangeRate: 0.98,
  reward: 200,
};

export default class InvoiceRequest extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    
  }
  async requestInvoice() {
    const thing = await requestInvoice({ contractAddress, spenAmount, });
    this.setState({ test: 1 });
  }
  render() {
    const { spendAmount } = testProps;
    return (
      <div>
        Requesting invoice for {spendAmount}...

      </div>
    );
  }
}
