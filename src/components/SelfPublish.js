import React, { Component } from 'react';
import { Button, Callout, Text, TextArea } from '@blueprintjs/core';

import { sha256 } from '../util';
import { explorerUrl } from '../config';
import { claimFunds } from '../api/web3';

// example
// efb331cb27fcf819f93bbd5db728aef3d01dd5bb6c4f902921d1c8aa8c984f59 preImage
// a8116aae8156942df1fd38f23f942577cdd3d5e7cd164a54aded394565b5a427 preImageHash

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
    // create and track the tx...
    const { preImageHash, preImage } = this.state;
    const { contractAddress } = this.props;
    const txid = await claimFunds({ contractAddress, preImageHash, preImage });
    this.setState({ txid });
  }
  renderClaiming() {
    const { txid } = this.state;
    if (txid) {
      return (
        <div>
          <a href={`${explorerUrl}/tx/${txid}`} target="_blank">
            {txid.slice(0, 10)}...
          </a>
        </div>
      );
    }
    return <div>Claming funds. Please wait...</div>;
  }
  render() {
    const { claiming, preImageHash } = this.state;
    if (claiming) { return this.renderClaiming(); }
    const { preImageHash: targetPreImageHash } = this.props;
    const canClaim = preImageHash;
    // const canClaim = preImageHash && (preImageHash === targetPreImageHash);
    // const cannotClaim = preImageHash && (preImageHash !== targetPreImageHash);
    return (
      <Callout title="Self-Publish" icon="send-to">
        <p>If the swap is created, so you can publish the preImage at any time using the form below, or wait for the swap provider to do so.</p>
        <p>Paste in your pre-image below to complete the swap yourself:</p>
        <Text onChange={this.changeInput} />
        <TextArea large fill onChange={this.changeInput} />
        <p>
          {/* {cannotClaim && <b>Sorry, the preImage does not match, try another one</b>} */}
          {canClaim && <Button type="submit" onClick={this.claimFunds}>Publish preImage</Button>}
        </p>
      </Callout>
    );
  }
}
