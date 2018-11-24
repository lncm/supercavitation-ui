import React, { Component } from 'react';

import InvoiceReqeust from './InvoiceRequest';

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
    this.state = { };
    this.changeSpendAmount = this.changeSpendAmount.bind(this);
    this.requestInvoice = this.requestInvoice.bind(this);
  }
  changeSpendAmount({ target }) {
    this.setState({ spendAmount: target.value });
  }
  requestInvoice() {
    this.setState({ request: true });
  }
  renderInput() {
    const { lockedFunds, minAmount, balance } = this.props;
    // TODO use web3 bignumber
    const maxAmount = balance - lockedFunds;
    if (minAmount >= maxAmount) {
      return <div>Sorry, Not enough funds in Swap Offer</div>;
    }
    const { reward, exchangeRate, timeLockNumber, depositFee } = this.props;
    const { spendAmount } = this.state;
    const exchangeAmount = exchangeRate * spendAmount;
    const totalFees = reward + depositFee;
    // TODO calculate this better!
    const minimumSpend = (minAmount / exchangeRate) + totalFees;
    const maximumSpend = (maxAmount / exchangeRate) - totalFees;
    const actualReceive = exchangeAmount - totalFees;
    return (
      <div>
        <input
          placeholder="Enter Amount"
          min={minimumSpend}
          max={maximumSpend}
          type="number"
          value={spendAmount}
          onChange={this.changeSpendAmount}
        />
        {!spendAmount || (minimumSpend > spendAmount || maximumSpend < spendAmount)
          ? <div>Enter an amount between {minimumSpend} and {maximumSpend}</div>
          : <button type="submit" onClick={this.requestInvoice}>Request Invoice</button>
        }
        {spendAmount
        && (
          <div>
            <pre>
              {
            JSON.stringify({
              exchangeRate,
              exchangeAmount,
              timeLockNumber,
              actualReceive,
              minimumSpend,
              maximumSpend,
            }, null, 2)
          }
            </pre>
        Fees = {depositFee} + {reward} = {totalFees}
            <br />
        Spend = {spendAmount}
            <br />
        Receive = {actualReceive}
          </div>

        )}
      </div>
    );
  }
  render() {
    const { request } = this.state;
    if (request) {
      return <InvoiceReqeust {...this.state} {...this.props} />;
    }
    return this.renderInput();
  }
}
