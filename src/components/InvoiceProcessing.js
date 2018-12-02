import React, { Component } from 'react';
import QRCode from 'qrcode.react';
import { Callout, Spinner } from '@blueprintjs/core';

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
    const { depositInvoice, paymentInvoice, preImageHash, depositInvoiceData, paymentInvoiceData } = await requestInvoices({ contractAddress, httpEndpoint, spendAmount });
    this.setState({
      preImageHash,
      invoice: depositInvoice || paymentInvoice,
      invoiceData: depositInvoiceData || paymentInvoiceData,
    });
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
            this.setState({
              invoice: paymentInvoice,
              invoiceData: paymentInvoiceData,
              mining: false,
            });
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
  // renderTimeout() {
  //   // TODO perhaps redirect to a URL that can be resolved?
  //   const { fullHash } = this.state;
  //   const { contractAddress } = this.props;
  //   return <Timeout {...{ fullHash, contractAddress }} />;
  // }
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
        Sorry, the swap timed out and was cancelled
      </Callout>
    );
  }
  render() {
    const { spendAmount } = this.props;
    const { invoice, miningTx, settleTx, preImageHash, mining, invoiceData, creationTx, completed, cancelled } = this.state;
    // TODO show 'timeout' box...
    // if (timeout) { return this.renderTimeout(); }
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
              Pay this invoice to receive <b>{spendAmount}</b> RBTC satoshis
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
        <pre>{JSON.stringify({ state: this.state, props: this.props }, null, 2)}</pre>
      </div>
    );
  }
}
