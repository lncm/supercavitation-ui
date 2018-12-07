import React, { Component } from 'react';
import QRCode from 'qrcode.react';
import { Callout, Spinner } from '@blueprintjs/core';

import { requestInvoices, getStatus } from '../api/http';
import { monitorSwap } from '../api/web3';

import SelfPublish from './SelfPublish';

// import Timeout from './Timeout';

export default class InvoiceProcessing extends Component {
  constructor(props) {
    super(props);
    // this.state = { timeout: true };
    this.state = { };
  }
  componentDidMount() {
    this.processInvoices();
  }
  componentWillUnmount() {
    this.poller.stop();
  }
  // TODO unmount stop polling!
  async beginPolling() {
    // lets poll the contract for the stuff we can verify ourselves
    console.log('polling starting...');
    const { preImageHash: passedPreImageHash, contractAddress, httpEndpoint } = this.props;
    const { paymentInvoice, paymentInvoiceData } = this.state;
    const preImageHash = this.state.preImageHash || passedPreImageHash;
    this.poller = await monitorSwap({
      preImageHash,
      contractAddress,
      onError: err => this.setState({ err }),
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
            this.setState({
              invoice: paymentInvoice,
              invoiceData: paymentInvoiceData,
              mining: false,
            });
            const { settleTx: miningTx } = await getStatus({ httpEndpoint, preImageHash });
            if (miningTx) {
              // TODO
              // we might not have the settle tx yet... server's not synced yet? anyway, just skip this and retry
              // either way, we need to show the timeout box here if it takes too long...
              this.setState({ mining: true, settleTx: miningTx, miningTx });
            }
          }
        } else if (!this.state.creationTx) {
          // if we're not created yet, we should wait for the status...
          // save all the data...
          try {
            // TODO, get the deposit tx info
            const { creationTx: miningTx } = await getStatus({ httpEndpoint, preImageHash });
            // console.log('got data', );
            this.setState({ mining: true, creationTx: miningTx, miningTx });
          } catch (err) {
            this.setState({ err: err.message });
          }
        }
      },
    });
  }
  async processInvoices() {
    // request the invoice if we don't have the preImageHash already, show deposit if required
    if (this.props.preImageHash) {
      this.setState({ preImageHash: this.props.preImageHash }, this.beginPolling);
    } else {
      const { requestedAmountInSatoshis, httpEndpoint, contractAddress } = this.props;
      const { depositInvoice, paymentInvoice, preImageHash, depositInvoiceData, paymentInvoiceData } = await requestInvoices({ contractAddress, httpEndpoint, requestedAmountInSatoshis });
      this.setState({
        preImageHash,
        invoice: depositInvoice || paymentInvoice,
        invoiceData: depositInvoiceData || paymentInvoiceData,
      }, this.beginPolling);
    }
  }
  renderComplete() {
    return (
      <Callout title="Swap Complete!" intent="success" icon="tick">
        Congratulations, the swap is settled!
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
    const { requestedAmountInSatoshis } = this.props;
    const { err, invoice, miningTx, settleTx, preImageHash, mining, invoiceData, creationTx, completed, cancelled } = this.state;
    if (err) { return <pre>{JSON.stringify(err)}</pre>}
    if (!invoiceData) { return <Spinner />; }
    if (completed) { return this.renderComplete(); }
    if (cancelled) { return this.renderCancelled(); }
    const uri = `lightning:${invoice}`;
    return (
      <div>
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
              Pay this invoice to receive <b>{requestedAmountInSatoshis}</b> RBTC satoshis
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
            <Callout style={{ overflowY: 'scroll' }}>
              Payment Hash (save for reference): {preImageHash}
            </Callout>
          </Callout>
        </div>
        )}
        <br />
        <SelfPublish {...this.state} {...this.props} />
        {/* {((creationTx && !mining) || settleTx) && <SelfPublish {...this.state} {...this.props} />} */}
        <pre>{JSON.stringify({ state: this.state, props: this.props }, null, 2)}</pre>
      </div>
    );
  }
}
