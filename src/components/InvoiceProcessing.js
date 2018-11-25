import React, { Component } from 'react';
import QRCode from 'qrcode.react';

import { requestSmallInvoice, requestFullInvoice, awaitMainPayment } from '../http';
import { awaitSwapStatus } from '../web3';

import Timeout from './Timeout';

// 0. Input amount you wish to get...
//
// 1. make request to bob to get invoice, sign the message
// 2. show the deposit payment invoice
// 3. wait for response (tx id)
//
// 4. Repat 1-3 for main invoice
//
// 5. See if bob automatically claims the rewards (timeout
//
// 6. Show UI to claim funds if not

export default class InvoiceProcessing extends Component {
  constructor(props) {
    super(props);
    this.state = { timeout: true };
  }
  componentDidMount() {
    // TODO uncomment
    // this.processInvoices();
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
    const { latestBlock, customer, reward, amount, cancelBlockHeight } = await awaitSwapStatus({ fullHash, contractAddress });
    // show status of the mined invoice
    this.setState({ latestBlock, customer, reward, amount, cancelBlockHeight, mining: false });
    // check if bob has made a transaction, and/or poll myself...
    const { txid: finalTx, timeout } = await awaitMainPayment({ httpEndpoint, fullHash });
    // show the status of bob's transaction or it timed out...
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
    const { invoice, txid, finalTx, mining, amount, timeout, complete, cancelBlockHeight, latestBlock } = this.state;
    if (timeout) { return this.renderTimeout(); }
    if (complete) { return this.renderCoplete(); }
    const uri = `lightning:${invoice}`;
    return (
      <div>
        {finalTx
          && (
          <div>
          Other party has submitted the swap settlement
            <a href={`https://explorer.testnet.rsk.co/tx/${finalTx}`} target="_blank">
              {finalTx.slice(0, 10)}...
            </a>
            <br />
          Please wait a few minutes for it to confirm...
          </div>
          )
          }
        {(amount && !finalTx)
        && (
          <div>
          Swap Confirmed pay the invoice to receive <b>{amount}</b> RSK within {cancelBlockHeight - latestBlock} blocks...
          </div>
        )}
        <pre>{JSON.stringify(this.state, null, 2)}</pre>
        {txid && (
        <div>
          {mining ? 'Mining' : 'Mined'} Transaction{' '}
          <a href={`https://explorer.testnet.rsk.co/tx/${txid}`} target="_blank">
            {txid.slice(0, 10)}...
          </a>!
        </div>
        )}
        {(invoice && !mining) && (
        <div>
          <QRCode value={uri} renderAs="svg" style={{ width: '100%', height: 'auto', maxHeight: '50vh' }} />
          <br />
          URI {uri};
        </div>
        )}
      </div>
    );
  }
}
