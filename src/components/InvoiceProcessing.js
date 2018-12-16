import React, { Component } from 'react';
import { Callout, Code, Spinner } from '@blueprintjs/core';

import { requestInvoices, getStatus } from '../api/http';
import { monitorSwap } from '../api/web3';

import SelfPublish from './SelfPublish';
import InvoicePaymentRequest from './InvoicePaymentRequest';
import InvoiceMiningTx from './InvoiceMiningTx';
import ExplorerLink from './ExplorerLink';

// TODO timeouts...

export default class InvoiceProcessing extends Component {
  constructor(props) {
    super(props);
    this.state = { };
    this.handleContractStateUpdate = this.handleContractStateUpdate.bind(this);
  }
  componentDidMount() {
    const { offline, preImageHash } = this.props;
    // if we are offline we can skip talking to bob, and just go straight to polling the contract
    if (offline) {
      this.setState({ preImageHash }, this.pollContract);
    } else {
      // otherwise, get the invoice data from bob first
      this.getInvoices();
    }
  }
  componentWillUnmount() {
    if (this.poller) { this.poller.stop(); }
  }
  async getInvoices() {
    const { owner, requestedAmountInSatoshis, httpEndpoint, contractAddress, preImageHash } = this.props;
    try {
      const swap = await (
        preImageHash
          // if we already have the preImageHash, request the existing invoice
          ? getStatus({ httpEndpoint, preImageHash, owner, existing: true })
          // otherwise, submit a request to get new invoices from bob
          : requestInvoices({ contractAddress, httpEndpoint, requestedAmountInSatoshis, owner })
      );
      // if we don't need to pay the deposit (or already paid it), we can skip showing the deposit invoice
      const invoice = (!swap.creationTx && swap.depositInvoice) || swap.paymentInvoice;
      const invoiceData = (!swap.creationTx && swap.depositInvoiceData) || swap.paymentInvoiceData;
      // show the invoice data in the UI
      this.setState({ ...swap, invoice, invoiceData }, this.pollContract);
    } catch (err) {
      // something went wrong on bob's side (or connection error), so let's show the error
      this.setState({ err: err.message, preImageHash }, this.pollContract);
    }
  }
  async pollContract() {
    // lets poll the contract for the stuff we can verify ourselves
    this.poller = await monitorSwap({
      preImageHash: this.state.preImageHash,
      contractAddress: this.props.contractAddress,
      updateState: this.handleContractStateUpdate,
      onError: err => this.setState({ err: err.message, ready: true }),
    });
  }
  async handleContractStateUpdate({ amount, state }) {
    const { offline, owner, httpEndpoint } = this.props;
    const { preImageHash, paymentInvoice, paymentInvoiceData, err: connectionError } = this.state;
    // always set the value + ready status (to hide the spinner)
    this.setState({ amount, ready: true });
    // state 'cancelled': we can stop now
    if (state === '3') {
      this.setState({ cancelled: true });
      return this.poller.stop();
    }
    // state 'completed': we can stop now
    if (state === '2') {
      this.setState({ completed: true });
      return this.poller.stop();
    }
    // the remaining logic deals with invoices, which we don't care about if bob is offline
    if (offline) { return null; }
    // stage 'created': we want to show the settle invoice and wait for it's tx to be mined
    if (state === '1') {
      const { settleTx } = this.state;
      // if we already have the settleTx, we can just wait; the poller will update the state when it's mined...
      if (settleTx) { return null; }
      // if we don't have a settle tx, show the qr code...
      this.setState({ mining: false, invoice: paymentInvoice, invoiceData: paymentInvoiceData });
      // and wait for it to be mined...
      const { settleTx: miningTx } = await getStatus({ httpEndpoint, preImageHash, owner });
      // now we can update the ui with the new mining tx and we loop back
      return this.setState({ mining: true, miningTx, settleTx: miningTx });
    }
    // at this point we don't have anything on-chain to help us, so we are relying on bob
    // only continue if there's no connection error with bob
    if (!connectionError) {
      const { creationTx } = this.state;
      // if we already have the creationTx, we can just wait
      if (creationTx) { return null; }
      // we dont have a creation tx yet; show the qr code and wait for it...
      const { miningTx } = await getStatus({ httpEndpoint, preImageHash, owner });
      return this.setState({ mining: true, miningTx, creationTx: miningTx });
    }
    return null;
  }
  renderComplete() {
    const { amount, settleTx } = this.state;
    return (
      <div>
        <Callout title="Swap Complete!" intent="success" icon="tick">
          Congratulations, the swap is settled for <b>{amount}</b> wei!
          {settleTx && <ExplorerLink type="tx" data={settleTx} />}
        </Callout>
      </div>
    );
  }
  renderCancelled() {
    return (
      <div>
        <Callout title="Swap Canclled!" intent="danger" icon="cross">
          Sorry, the swap timed out and is cancelled
        </Callout>
      </div>
    );
  }
  render() {
    const { offline } = this.props;
    const { err, ready, amount, invoice, miningTx, settleTx, preImageHash, mining, invoiceData, creationTx, completed, cancelled } = this.state;
    if (!ready) { return <Spinner />; }
    if (completed) { return this.renderComplete(); }
    if (cancelled) { return this.renderCancelled(); }
    const canPublish = amount && amount > 0;
    return (
      <div>
        <div>
          <Callout>
            Save this <b>preImageHash</b> for future reference:
            <Code className="scrollx">{preImageHash}</Code>
          </Callout>
        </div>
        {/* Errors & Mining Status */}
        <div>
          {!canPublish && err && <Callout intent="danger" title="Error">{err}</Callout>}
          {!canPublish && offline && <Callout intent="danger" title="Error">The preImageHash you entered is not recognised</Callout>}
          {miningTx && <InvoiceMiningTx {...{ settleTx, mining, miningTx }} />}
        </div>
        {/* UI for the swap creation */}
        <div>
          {offline && canPublish && <Callout intent="success" title="Swap is created">For amount <b>{amount}</b></Callout>}
          {invoice && !mining && <InvoicePaymentRequest invoice={invoice} invoiceAmount={invoiceData.amount} swapAmountWei={creationTx && amount} />}
        </div>
        {/* Self Publish Box */}
        <div>
          {canPublish && <SelfPublish {...this.state} {...this.props} />}
          {/* <pre>{JSON.stringify({ state: this.state, props: this.props }, null, 2)}</pre> */}
        </div>
      </div>
    );
  }
}
