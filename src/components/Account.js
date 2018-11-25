import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { Navbar, Alignment, Button, Text, TextArea } from '@blueprintjs/core';

import Offering from './Offering';
import Registry from './Registry';


import { getAccountInfo } from '../web3';

const randomMnemonic = 'drama rescue intact royal denial oblige direct vendor market soda mandate accident';


export default class Account extends Component {
  constructor(props) {
    super(props);
    this.state = { mnemonic: '' };
    // this.state = { mnemonic: randomMnemonic, address: '0x0f18cd0F5B7CcE9d6DCC246F80B0fCdd7a2AF150', balance: 123123 };
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
            <Navbar.Heading>Subcavitation Swaps</Navbar.Heading>
          </Navbar.Group>
          <Navbar.Group align={Alignment.RIGHT}>
            {this.renderAccountBalance()}
          </Navbar.Group>
        </Navbar>
        <div className="content">
          <Switch>
            <Route path="/registry/:contractAddress" component={Registry} />
            <Route path="/offering/:contractAddress" component={Offering} />
            <Redirect from="/offering" to="/offering/0xc0e3dc17ae44a92641bdad430f2cc5e88d58a564" />
            <Redirect from="/registry" to="/registry/0x1234" />
            <Redirect from="/" to="/registry/0x1234" />
          </Switch>
        </div>
      </div>
    );
  }
}
