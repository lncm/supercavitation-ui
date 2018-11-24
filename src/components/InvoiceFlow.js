import React, { Component } from 'react';

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

export default class InvoiceFlow extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { balance, owner, depositFee, lockedFunds, reward, exchangeRate, timeLockNumber, minAmount } = this.props;
    const { purchaseAmount } = this.state;
    // TODO use web3 bignumber
    // fake balance
    const maxAmount = 1 * 1e18 - lockedFunds;
    // const maxAmount = balance - lockedFunds;
    if (minAmount >= maxAmount) {
      return <div>Sorry, Not enough funds in Swap Offer</div>;
    }
    return (
      <div>
        <pre>{JSON.stringify({ maxAmount, minAmount }, null, 2)}</pre>
        <input type="number" value={this.purchaseAmount} onChange={this.changePurchaseAmount} />
      </div>
    );
  }
}
