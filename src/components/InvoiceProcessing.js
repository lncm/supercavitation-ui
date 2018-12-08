import React, { Component } from 'react';
import QRCode from 'qrcode.react';
import { Callout, Spinner } from '@blueprintjs/core';

import { requestInvoices, getStatus } from '../api/http';
import { monitorSwap } from '../api/web3';

import SelfPublish from './SelfPublish';

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
    const { offline, requestedAmountInSatoshis, httpEndpoint, contractAddress, preImageHash } = this.props;
    if (offline) {
      this.setState({ preImageHash }, this.beginPolling);
    } else {
      // if we have a preImage passed, we can get the status - otherwise, request invoice...
      try {
        const swap = await (preImageHash
          ? getStatus({ httpEndpoint, preImageHash, existing: true })
          : requestInvoices({ contractAddress, httpEndpoint, requestedAmountInSatoshis }));
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
    const { offline, contractAddress, httpEndpoint } = this.props;
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
        } else if (amount > '0') {
          // do nothing if we're in offline mode...
          if (offline) { return null; }
          // if we are waiting for the settleTx to be mined...
          const { settleTx: miningTx } = this.state;
          if (miningTx) {
            return this.setState({ mining: true, miningTx, settleTx: miningTx });
          }
          // if we don't have a settle tx, show the qr code and wait for it...
          this.setState({
            mining: false,
            invoice: paymentInvoice,
            invoiceData: paymentInvoiceData,
          });
          const { settleTx } = await getStatus({ httpEndpoint, preImageHash });
          return this.setState({ mining: true, settleTx, miningTx: settleTx });
        } else {
          // do nothing if we're in offline mode...
          if (offline || connectionError) { return null; }
          // if we are waiting for the creationTx to be mined...
          const { creationTx: miningTx } = this.state;
          if (miningTx) {
            return this.setState({ mining: true, miningTx, creationTx: miningTx });
          }
          // we dont have a creation tx; show the qr code and wait for it...
          const { creationTx } = await getStatus({ httpEndpoint, preImageHash });
          this.setState({ mining: true, creationTx, miningTx: creationTx });
        }
      },
    });
  }
  renderComplete() {
    const { settleTx } = this.state;
    return (
      <Callout title="Swap Complete!" intent="success" icon="tick">
        Congratulations, the swap is settled!
        {settleTx && <span className="trunchate"><a href={`https://explorer.testnet.rsk.co/tx/${settleTx}`} target="_blank">{settleTx}</a></span>}
      </Callout>
    );
  }
  renderCancelled() {
    return (
      <Callout title="Swap Canclled!" intent="danger" icon="cross">
        Sorry, the swap timed out and is cancelled
      </Callout>
    );
  }
  render() {
    const { offline } = this.props;
    const { err, ready, amount, invoice, miningTx, settleTx, preImageHash, mining, invoiceData, creationTx, completed, cancelled } = this.state;
    if (!ready) { return <Spinner />; }
    if (completed) { return this.renderComplete(); }
    if (cancelled) { return this.renderCancelled(); }
    const uri = `lightning:${invoice}`;
    const canPublish = amount && amount > 0;
    return (
      <div>
        <Callout icon={null} intent="primary" title="Swap preImageHash">
          <b>Save for future reference</b>
          <div style={{ overflowY: 'scroll' }}>
            {preImageHash}
          </div>
        </Callout>
        <br />
        {(!canPublish && err) && (
          <Callout intent="danger" title="Error">
            {err}
          </Callout>
        )}
        {canPublish && (
          <Callout intent="success" title="Swap is created">
            For amount <b>{amount}</b>
          </Callout>
        )}
        {!canPublish && offline && (
          <Callout intent="danger" title="Something went wrong">
            The preImageHash you entered is not recognised
          </Callout>
        )}
        {miningTx && (
        <Callout
          intent={mining ? 'warning' : 'success'}
          title={mining ? 'Mining Transaction' : 'Mined Transaction'}
        >
          {mining
            && (
            <div>
              {settleTx
                ? <div>Bob has published the swap settlement!</div>
                : <div>Bob is creating the swap!</div>
            }
            </div>
            )
          }
          {!mining
            && (
            <div>
              {settleTx
                ? <div>The swap is settled!</div>
                : <div>Bob has created the swap and it matches the payment hash; you can safely pay the invoice!</div>
            }
            </div>
            )
          }
          <span className="trunchate"><a href={`https://explorer.testnet.rsk.co/tx/${miningTx}`} target="_blank">{miningTx}</a></span>
          {mining && <div>Please wait a monent for it to be mined...</div>}
        </Callout>
        )}
        {(invoice && !mining) && (
        <div>
          <Callout title="Scan or Tap To Pay">
            <div>This invoice requests <b>{invoiceData.amount}</b> LN satoshis</div>
            {creationTx
              ? (
                <div style={{ marginBottom: '0.5em' }}>
              Pay this invoice to receive <b>{amount}</b> wei
                </div>
              )
              : (
                <div style={{ marginBottom: '0.5em' }}>
              Pay this deposit to generate the swap
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
        <br />
        {canPublish && <SelfPublish {...this.state} {...this.props} />}
        {/* <pre>{JSON.stringify({ state: this.state, props: this.props }, null, 2)}</pre> */}
      </div>
    );
  }
}
