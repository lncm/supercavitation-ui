import React, { Component } from 'react';

import { getBalance } from '../web3';

import { AccountContext } from '../contexts';

export default class Balance extends Component {
  static contextType = AccountContext;
  constructor(props) {
    super(props);
    this.state = { };
    this.getBalance = this.getBalance.bind(this);
  }
  componentDidMount() {
    this.getBalance();
  }
  async getBalance() {
    const { address } = this.context;
    this.setState({ balance: await getBalance(address) });
  }
  render() {
    const { balance } = this.state;
    const { address } = this.context;
    return (
      <div>
        <div>Hello <b>{address}</b></div>
        {balance && <div>Your balance is <b>{balance}</b> RSK</div>}
      </div>
    );
  }
}
