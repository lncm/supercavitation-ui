import React, { Component } from 'react';
import Web3 from 'web3';
import { Button, Callout, NumericInput } from '@blueprintjs/core';

const { utils: { toBN } } = Web3;

export default class InvoiceFlow extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.onSubmit = this.onSubmit.bind(this);
    this.onChangeRequestedAmount = this.onChangeRequestedAmount.bind(this);
  }
  onChangeRequestedAmount(amount) {
    this.setState({ requestedAmountInSatoshis: amount });
  }
  onSubmit() {
    this.props.onSubmit(this.state.requestedAmountInSatoshis);
  }
  render() {
    const { exchangeRate, timeLockBlocks, depositFeeSatoshis, lockedFunds, minAmountSatoshis, balance, rewardWei, supercavitationWei } = this.props;
    const { requestedAmountInSatoshis } = this.state;
    const maxAmount = toBN(balance).sub(toBN(lockedFunds));
    const minAmount = toBN(minAmountSatoshis).mul(toBN(1e10));
    if (minAmount.gt(maxAmount)) {
      return (
        <Callout title="Sorry" intent="warning" icon="cross">
          There are not enough unlocked funds in this swap contract to request an order.
        </Callout>
      );
    }
    const spendAmount = toBN(requestedAmountInSatoshis || 0);
    const amountOfferedInWei = spendAmount.mul(toBN(exchangeRate));
    const depositFeeInWei = toBN(depositFeeSatoshis).pow(toBN(10));
    const amountAfterFeesWei = amountOfferedInWei.sub(toBN(rewardWei)).sub(toBN(supercavitationWei)).sub(toBN(depositFeeInWei));
    const min = Math.ceil(minAmount.div(toBN(1e10)).toNumber());
    const max = Math.floor(maxAmount.div(toBN(1e10)).toNumber());
    const badAmount = requestedAmountInSatoshis > max || requestedAmountInSatoshis < min;
    return (
      <Callout title="Request New Invoice" intent="primary" icon="cell-tower">
        Enter amount of <b>satoshis</b> you wish to spend
        <NumericInput
          placeholder="Enter Amount"
          min={min}
          max={max}
          type="number"
          large
          leftIcon="exchange"
          stepSize={1}
          value={requestedAmountInSatoshis || ''}
          fill
          allowNumericCharactersOnly
          intent="primary"
          onValueChange={this.onChangeRequestedAmount}
        />
        <div style={{ paddingBottom: '0.5em' }} />
        {badAmount
          ? <div>Enter an integer between {min} and {max}</div>
          : <Button large fill intent="primary" icon="tick-circle" type="submit" onClick={this.onSubmit} text="Submit" />
        }
        {!badAmount && (
        <ul>
          <li>You will spend <b>{requestedAmountInSatoshis}</b> satoshis</li>
          <li>And a <b>{depositFeeSatoshis}</b> satoshi deposit fee</li>
          <li>You will receive <b>{amountAfterFeesWei.toString()}</b> Wei</li>
          <li>You must pay within <b>{timeLockBlocks} blocks</b></li>
        </ul>
        )}
      </Callout>
    );
  }
}
