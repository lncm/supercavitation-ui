import React, { Component } from 'react';
import QRCode from 'qrcode.react';
import { Callout } from '@blueprintjs/core';

import { explorerUrl } from '../util';
import { requestSmallInvoice, requestFullInvoice, awaitMainPayment } from '../http';
import { awaitSwapStatus, awaitTxMined } from '../web3';

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
  async processInvoices() {
    const { spendAmount, httpEndpoint, contractAddress } = this.props;
    // request + make the deposit
    const { msg: { invoice, hash: smallHash } } = await requestSmallInvoice({ httpEndpoint, spendAmount });
    this.setState({ invoice });
    // payment is made, get the big invoice
    const { txid, msg: { invoice: fullInvoice, hash: fullHash } } = await requestFullInvoice({ smallHash, httpEndpoint });
    // show confirmation of payment + tx sending
    this.setState({ mining: true, txid, invoice: fullInvoice, fullHash });
    // poll for the tx to be mined
    await awaitTxMined({ txid });
    // show status of the mined invoice
    this.setState({ mining: false });
    // check if bob has made a transaction, and/or poll myself...
    const { txid: finalTx, timeout } = await awaitMainPayment({ httpEndpoint, fullHash });
    // show the status of bob's transaction or it timed out...
    console.log('got final?', finalTx);
    this.setState({ finalTx, timeout });
    // one more manual fallback, to confirm it's completed
    const completedState = await awaitSwapStatus({ fullHash, contractAddress });
    // set completed to true if it didn't time out, it muts be done...
    const complete = !completedState.timeout;
    // we're done, but need to deal with timeout
    this.setState({ ...completedState, complete, timeout: !complete });
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
    const { invoice, txid, finalTx, spendAmount, mining, amount, timeout, complete, cancelBlockHeight, latestBlock } = this.state;
    if (timeout) { return this.renderTimeout(); }
    if (complete) { return this.renderCoplete(); }
    const uri = `lightning:${invoice}`;
    return (
      <div>
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
        {txid && (
        <Callout
          intent={mining ? 'warning' : 'success'}
          title={mining ? 'Mining Transaction' : 'Mined Transaction'}
        >
          <a className="trunchate" href={`https://explorer.testnet.rsk.co/tx/${txid}`} target="_blank">{txid}</a>
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
          </Callout>
        </div>
        )}
      </div>
    );
  }
}
