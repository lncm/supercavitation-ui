import React, { Component } from 'react';

import { getAccountInfo } from '../web3';

const randomMnemonic = 'drama rescue intact royal denial oblige direct vendor market soda mandate accident';


export default class Account extends Component {
  constructor(props) {
    super(props);
    this.state = { mnemonic: '' };
    this.generateMnemonic = this.generateMnemonic.bind(this);
    this.changeInput = this.changeInput.bind(this);
  }
  componentDidMount() {
    this.generateMnemonic();
  }
  generateMnemonic() {
    this.setState({ mnemonic: randomMnemonic }, this.validateMnemonic);
  }
  changeInput({ target }) {
    this.setState({ mnemonic: target.value }, this.validateMnemonic);
  }
  async validateMnemonic() {
    // do some validation...
    try {
      const { mnemonic } = this.state;
      const accountInfo = await getAccountInfo(mnemonic);
      if (!accountInfo) { throw new Error('No address'); }
      this.setState({ error: null, ...accountInfo });
    } catch (e) {
      this.setState({ error: 'Invalid Mnemonic' });
    }
  }
  render() {
    const { error, address, balance, mnemonic } = this.state;
    const { children } = this.props;
    if (address) {
      return (
        <div>
          <div>Hello <b>{address}</b></div>
          {balance && <div>Your balance is <b>{balance}</b> RSK</div>}
          <br />
          {children}
        </div>
      );
    }
    return (
      <div>
        Hello, paste in your mnemonic below...
        <br />
        {error && `${error}`}
        <br />
        <textarea value={mnemonic} onChange={this.changeInput} />
        <br />
        {!mnemonic && <button type="submit" onClick={this.generateMnemonic}>Generate</button>}
      </div>
    );
  }
}
