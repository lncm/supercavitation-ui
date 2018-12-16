import React, { Component } from 'react';
import { Button, Text, TextArea, Callout } from '@blueprintjs/core';

import { randomMnemonic } from '../config';
import { initializeWeb3 } from '../api/web3';


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
    try {
      const { mnemonic } = this.state;
      const { address } = await initializeWeb3(mnemonic, () => this.setState({ err: 'Could not connect' }));
      if (!address) { throw new Error('Invalid Mnemonic'); }
      this.setState({ err: null, address });
    } catch (e) {
      this.setState({ err: e.message });
    }
  }
  // renderAccountBalance() {
  //   const { address, balance } = this.state;
  //   return (
  //     <span className="trunchate" style={{ textAlign: 'right' }}>
  //       Hello <b>{address}</b>
  //       {balance && <span><br />You have <b>{balance}</b> wei</span>}
  //     </span>
  //   );
  // }
  renderLogin() {
    const { mnemonic, err } = this.state;
    return (
      <div className="container">
        <h2>To begin, paste in your Mnemonic below...</h2>
        <Text value={mnemonic} onChange={this.changeInput} />
        <TextArea large fill onChange={this.changeInput} value={mnemonic} />
        <br /><br />
        {!mnemonic && <Button rightIcon="arrow-right" intent="success" large text="Or Generate One" onClick={this.generateMnemonic} />}
        {err && <Callout intent="danger" title="Error">{err}</Callout>}
      </div>
    );
  }
  render() {
    const { address } = this.state;
    if (!address) { return this.renderLogin(); }
    return this.props.children;
  }
}
