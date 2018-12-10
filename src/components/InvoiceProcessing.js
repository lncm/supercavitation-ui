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
  }
  componentDidMount() {
    this.processInvoices();
  }
  componentWillUnmount() {
    if (this.poller) { this.poller.stop(); }
  }
  async processInvoices() {
    // request the invoice if we don't have the preImageHash already, show deposit if required
    const { offline, owner, requestedAmountInSatoshis, httpEndpoint, contractAddress, preImageHash } = this.props;
    if (offline) {
      this.setState({ preImageHash }, this.beginPolling);
    } else {
      // if we have a preImage passed, we can get the status - otherwise, request invoice...
      try {
        const swap = await (preImageHash
          ? getStatus({ httpEndpoint, preImageHash, owner, existing: true })
          : requestInvoices({ contractAddress, httpEndpoint, requestedAmountInSatoshis, owner }));
        this.setState({
          ...swap,
          invoice: (!swap.creationTx && swap.depositInvoice) || swap.paymentInvoice,
          invoiceData: (!swap.creationTx && swap.depositInvoiceData) || swap.paymentInvoiceData,
        }, this.beginPolling);
      } catch (err) {
        // show that bob's gone offline
        this.setState({ err: err.message, preImageHash }, this.beginPolling);
      }
    }
  }
  async beginPolling() {
    // lets poll the contract for the stuff we can verify ourselves
    const { offline, owner, contractAddress, httpEndpoint } = this.props;
    const { preImageHash, paymentInvoice, paymentInvoiceData, err: connectionError } = this.state;
    this.poller = await monitorSwap({
      preImageHash,
      contractAddress,
      onError: err => this.setState({ err: err.message, ready: true }),
      updateState: async ({ amount, state }) => {
        this.setState({ amount, ready: true });
        if (state === '2') {
          this.setState({ cancelled: true }); // we are done
          this.poller.stop();
        } else if (state === '1') {
          this.setState({ completed: true }); // we are done
          this.poller.stop();
        // do nothing if we're in offline mode...
        } else if (amount > '0' && !offline) {
          const { settleTx: miningTx } = this.state;
          if (miningTx) {
            // if we are waiting for the settleTx to be mined...
            this.setState({ mining: true, miningTx, settleTx: miningTx });
          } else {
            // if we don't have a settle tx, show the qr code and wait for it...
            this.setState({
              mining: false,
              invoice: paymentInvoice,
              invoiceData: paymentInvoiceData,
            });
            const { settleTx } = await getStatus({ httpEndpoint, preImageHash, owner });
            this.setState({ mining: true, settleTx, miningTx: settleTx });
          }
        // do nothing if we're in offline mode...
        } else if (!offline && !connectionError) {
          const { creationTx: miningTx } = this.state;
          if (miningTx) {
            // if we are waiting for the creationTx to be mined...
            this.setState({ mining: true, miningTx, creationTx: miningTx });
          } else {
            // we dont have a creation tx; show the qr code and wait for it...
            const { creationTx } = await getStatus({ httpEndpoint, preImageHash, owner });
            this.setState({ mining: true, creationTx, miningTx: creationTx });
          }
        }
      },
    });
  }
  renderComplete() {
    const { settleTx } = this.state;
    return (
      <div>
        <Callout title="Swap Complete!" intent="success" icon="tick">
          Congratulations, the swap is settled!
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
