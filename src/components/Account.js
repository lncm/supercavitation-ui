import React, { Component } from 'react';
import { Navbar, Alignment, Button, Text, TextArea } from '@blueprintjs/core';

import Main from './Main';

import { randomMnemonic } from '../config';
import { getAccountInfo } from '../api/web3';


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
  renderAccountBalance() {
    const { address, balance } = this.state;
    return (
      <span className="trunchate" style={{ textAlign: 'right' }}>
        Hello <b>{address}</b>
        {balance && <span><br />Your balance is <b>{balance} RSK</b></span>}
      </span>
    );
  }
  renderLogin() {
    const { mnemonic, error } = this.state;
    return (
      <div className="container" style={{ textAlign: 'center' }}>
        <h2>To begin, paste in your Mnemonic below...</h2>
        <Text value={mnemonic} onChange={this.changeInput} />
        <TextArea large fill onChange={this.changeInput} value={mnemonic} />
        <br /><br />
        {!mnemonic && <Button rightIcon="arrow-right" intent="success" large text="Or Generate One" onClick={this.generateMnemonic} />}
        {error && `${error}`}
      </div>

    );
  }
  render() {
    const { address } = this.state;
    if (!address) { return this.renderLogin(); }
    return (
      <div className="container">
        <Navbar>
          <Navbar.Group align={Alignment.LEFT}>
            <Navbar.Heading>Supercavitation Swaps</Navbar.Heading>
          </Navbar.Group>
          <Navbar.Group align={Alignment.RIGHT}>
            {this.renderAccountBalance()}
          </Navbar.Group>
        </Navbar>
        <Main />
      </div>
    );
  }
}
