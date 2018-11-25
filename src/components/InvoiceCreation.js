import React, { Component } from 'react';
import { Button, Callout, NumericInput } from '@blueprintjs/core';

import InvoiceProcessing from './InvoiceProcessing';

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
  changeSpendAmount(amount) {
    this.setState({ spendAmount: amount });
  }
  requestInvoice() {
    this.setState({ request: true });
  }
  renderInput() {
    const { lockedFunds, minAmount, balance } = this.props;
    // TODO use web3 bignumber
    const maxAmount = balance - lockedFunds;
    if (minAmount >= maxAmount) {
      return (
        <Callout title="Sorry" intent="warning" icon="cross">
          There aren't enough funds in in this swap contract to request an order
        </Callout>
      );
    }
    const { reward, exchangeRate, timeLockNumber, depositFee } = this.props;
    const { spendAmount } = this.state;
    const exchangeAmount = Math.round(exchangeRate * spendAmount);
    const totalFees = reward + depositFee;
    // TODO calculate this better!
    const minimumSpend = Math.ceil((minAmount / exchangeRate) + totalFees);
    const maximumSpend = Math.floor((maxAmount / exchangeRate) - totalFees);
    const actualReceive = exchangeAmount - totalFees;
    const badAmount = !spendAmount || (minimumSpend > spendAmount || maximumSpend < spendAmount);
    return (
      <Callout title="Request Invoice" intent="primary" icon="cell-tower">
        <NumericInput
          placeholder="Enter Amount"
          min={minimumSpend}
          max={maximumSpend}
          type="number"
          large
          leftIcon="exchange"
          stepSize={1}
          value={spendAmount}
          fill
          allowNumericCharactersOnly
          intent="primary"
          onValueChange={this.changeSpendAmount}
        />
        <div style={{ paddingBottom: '0.5em' }} />
        {badAmount
          ? <div>Enter an integer between {minimumSpend} and {maximumSpend}</div>
          : <Button large fill intent="primary" icon="tick-circle" type="submit" onClick={this.requestInvoice} text="Submit" />
        }
        {!badAmount && (
        <ul>
          <li>Fee are {depositFee} + {reward} = <b>{totalFees}</b></li>
          <li>You spend <b>{spendAmount}</b></li>
          <li>Receive <b>{actualReceive}</b></li>
          <li>You'll have to pay within <b>{timeLockNumber} blocks</b></li>
        </ul>
        )}
      </Callout>
    );
  }
  render() {
    const { request } = this.state;
    if (request) {
      return <InvoiceProcessing {...this.state} {...this.props} />;
    }
    return this.renderInput();
  }
}
