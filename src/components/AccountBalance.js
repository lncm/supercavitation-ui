import React, { Component } from 'react';

import { getBalance } from '../api/web3';

import { Web3ConnectionContext } from './Web3Connection';

export default class AccountBalance extends Component {
  static contextType = Web3ConnectionContext;
  constructor(props) {
    super(props);
    this.state = {}
    this.getBalance = this.getBalance.bind(this);
  }
  componentDidMount() {
    this.getBalance();
  }
  async getBalance() {
    this.setState({ balance: await getBalance(this.context.address) });
  }
  render() {
    return (
      <div className="trunchate" style={{ textAlign: 'right' }}>
        Hello <b>{this.context.address}</b>
        <br />
        Your balance is <b>{this.state.balance}</b> wei
      </div>
    );
  }
}
