import React, { Component } from 'react';

import { sha256 } from '../util';
import { monitorSwap, claimFunds } from '../web3';

// example
// efb331cb27fcf819f93bbd5db728aef3d01dd5bb6c4f902921d1c8aa8c984f59 preImage
// a8116aae8156942df1fd38f23f942577cdd3d5e7cd164a54aded394565b5a427 preImageHash

export default class Timeout extends Component {
  constructor(props) {
    super(props);
    this.state = { };
    // this.getHash = this.getHash.bind(this);
    this.onChange = this.onChange.bind(this);
    this.updateState = this.updateState.bind(this);
    this.claimFunds = this.claimFunds.bind(this);
  }
  componentWillUnmount() {
    if (this.poller) {
      this.poller.stop();
    }
  }
  async onChange({ target }) {
    const preImage = target.value.replace('0x', '').trim();
    const preImageHash = await sha256(preImage);
    this.setState({ preImageHash, preImage }, this.startMonitoring);
    // start polling for updates...
  }
  startMonitoring() {
    if (this.poller) {
      this.poller.stop();
    }
    const { preImageHash } = this.state;
    const { contractAddress } = this.props;
    this.poller = monitorSwap({ preImageHash, contractAddress, updateState: this.updateState });
  }
  updateState(newState) {
    this.setState(newState);
  }
  async claimFunds() {
    this.setState({ claiming: true });
    // create and track the tx...
    const { preImageHash, preImage } = this.state;
    const { contractAddress } = this.props;
    const { txid } = await claimFunds({ contractAddress, preImageHash, preImage });
    this.setState({ txid });
  }
  renderClaiming() {
    const { txid } = this.state;
    if (txid) {
      return (
        <div>
          <a href={`https://explorer.testnet.rsk.co/tx/${txid}`} target="_blank">
            {txid.slice(0, 10)}...
          </a>
        </div>
      );
    }
    return <div>Claming funds. Please wait...</div>;
  }
  render() {
    const { claiming, amount, state } = this.state;
    if (claiming) { return this.renderClaiming(); }
    const canClaim = amount > 0 && state === '0';
    return (
      <div>
        Your contract timed out, but do not fear!
        <br />
        <textarea placeholder="Paste payment hash here" onChange={this.onChange} />
        <br />
        {amount === '0' && <div>Sorry, it the preImage is not recognised...</div>}
        {state && state !== '0' && <div>Swap has been completed already</div>}
        {canClaim && <button type="submit" onClick={this.claimFunds}>Valid preImage - Claim {amount} RBCT</button>}
        <hr />
        <pre>{JSON.stringify({ ...this.props, ...this.state }, null, 2)}</pre>
      </div>
    );
  }
}
