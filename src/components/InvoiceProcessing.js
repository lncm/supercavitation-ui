import React, { Component } from 'react';
import QRCode from 'qrcode.react';
import { Callout } from '@blueprintjs/core';

import { explorerUrl } from '../util';
import { requestInvoices, getStatus } from '../http';
import { monitorSwap } from '../web3';

import Timeout from './Timeout';

export default class InvoiceProcessing extends Component {
  constructor(props) {
    super(props);
    // this.state = { timeout: true };
    this.state = { };
  }
  componentDidMount() {
    this.processInvoices();
  }
  // TODO unmount stop polling!
  async processInvoices() {
    const { spendAmount, httpEndpoint, contractAddress } = this.props;
    // request the invoice, show deposit if required
    const { depositInvoice, paymentInvoice, preImageHash } = await requestInvoices({ contractAddress, httpEndpoint, spendAmount });
    this.setState({ preImageHash, invoice: depositInvoice || paymentInvoice });
    // lets poll the contract for the stuff we can verify ourselves
    this.poller = await monitorSwap({
      preImageHash,
      contractAddress,
      updateState: async ({ amount, state }) => {
        if (state === '2') {
          this.setState({ cancelled: true }); // we are done
          this.poller.stop();
        } else if (state === '1') {
          this.setState({ completed: true }); // we are done
          this.poller.stop();
        } else if (amount > '0') {
          // the swap is created...
          if (!this.state.settleTx) {
            this.setState({ invoice: paymentInvoice, mining: false });
            const { settleTx: miningTx } = await getStatus({ httpEndpoint, preImageHash });
            if (miningTx) {
              // we might not have the settle tx yet... server's not synced yet? anyway, just skip this and retry
              // either way, we need to show the timeout box here if it takes too long...
              this.setState({ mining: true, settleTx: miningTx, miningTx });
            }
          }
        } else if (!this.state.creationTx) {
          // if we're not created yet, we should wait for the status...
          const { creationTx: miningTx } = await getStatus({ httpEndpoint, preImageHash });
          this.setState({ mining: true, creationTx: miningTx, miningTx });
        }
      },
    });
  }
  renderTimeout() {
    // TODO perhaps redirect to a URL that can be resolved?
    const { fullHash } = this.state;
    const { contractAddress } = this.props;
    return <Timeout {...{ fullHash, contractAddress }} />;
  }
  renderComplete() {
    // TODO show status + updated balance
    return <div>Swap Complete!</div>;
  }
  render() {
    const { invoice, miningTx, finalTx, preImageHash, mining, amount, timeout, complete } = this.state;
    // if (timeout) { return this.renderTimeout(); }
    // if (complete) { return this.renderComplete(); }
    const uri = `lightning:${invoice}`;
    return (
      <div>
        <pre>{JSON.stringify(this.state, null, 2)}</pre>
        {finalTx
          && (
          <div>
          Other party has submitted the swap settlement
            <a href={`${explorerUrl}/tx/${finalTx}`} target="_blank">
              {finalTx.slice(0, 10)}...
            </a>
            <br />
          Please wait a few minutes for it to confirm...
          </div>
          )
          }
        {miningTx && (
        <Callout
          intent={mining ? 'warning' : 'success'}
          title={mining ? 'Mining Transaction' : 'Mined Transaction'}
        >
          <a className="trunchate" href={`https://explorer.testnet.rsk.co/tx/${miningTx}`} target="_blank">{miningTx}</a>
        </Callout>
        )}
        {(invoice && !mining) && (
        <div>
          <Callout title="Scan or Tap To Pay">
            {(amount && !finalTx)
              ? (
                <div style={{ marginBottom: '0.5em' }}>
              Pay the invoice to receive <b>{amount}</b> RBTC
                </div>
              )
              : (
                <div style={{ marginBottom: '0.5em' }}>
              Pay the deposit to generate a swap contract
                </div>
              )
            }
            <a href={uri}>
              <QRCode value={uri} renderAs="svg" style={{ width: '100%', height: 'auto', maxHeight: '50vh' }} />
              <Callout style={{ overflowY: 'scroll' }}>
                {uri}
              </Callout>
            </a>
            <Callout style={{ overflowY: 'scroll' }}>
              Payment Hash: {preImageHash}
            </Callout>
          </Callout>
        </div>
        )}
      </div>
    );
  }
}
