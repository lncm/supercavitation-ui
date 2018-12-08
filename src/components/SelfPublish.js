import React, { Component } from 'react';
import { Button, Callout, Text, TextArea } from '@blueprintjs/core';

import { sha256 } from '../util';
import { claimFunds } from '../api/web3';

import ExplorerLink from './ExplorerLink';

export default class SelfPublish extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.changeInput = this.changeInput.bind(this);
    this.claimFunds = this.claimFunds.bind(this);
  }
  async changeInput({ target }) {
    const preImage = target.value.replace('0x', '').trim();
    const preImageHash = await sha256(preImage);
    this.setState({ preImageHash, preImage });
  }
  async claimFunds() {
    this.setState({ claiming: true });
    const { preImageHash, preImage } = this.state;
    const { contractAddress } = this.props;
    const txid = await claimFunds({ contractAddress, preImageHash, preImage });
    this.setState({ txid });
  }
  renderClaiming() {
    const { txid } = this.state;
    return (
      <Callout title="Publishing" icon="time" intent="warning">
        <div>Publishing Transaction. Please wait...</div>
        {txid && <ExplorerLink type="tx" data={txid} />}
      </Callout>
    );
  }
  render() {
    const { claiming, preImageHash } = this.state;
    if (claiming) { return this.renderClaiming(); }
    const { preImageHash: targetPreImageHash } = this.props;
    const missMatch = targetPreImageHash && targetPreImageHash !== preImageHash;
    return (
      <Callout title="Self-Publish" icon="send-to" intent="warning">
        <p>If bob does not settle the swap, you can publish the preImage to complete the swap yourself:</p>
        <Text onChange={this.changeInput} />
        <TextArea large fill onChange={this.changeInput} placeholder="Paste preImage" />
        {preImageHash && (
          <div>
            <br />
            <Button type="submit" onClick={this.claimFunds}>Publish preImage</Button>
            {missMatch && <b>Pasted preImage does not match current swap</b>}
          </div>
        )}
      </Callout>
    );
  }
}
