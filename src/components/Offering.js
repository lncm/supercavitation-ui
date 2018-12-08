import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Spinner, Button, HTMLTable } from '@blueprintjs/core';
import { explorerUrl } from '../config';

import { getContractInfo } from '../api/web3';
import { getOfferingInfo } from '../api/http';

import InvoiceCreation from './InvoiceCreation';

const explorerLink = addr => <a target="_blank" href={`${explorerUrl}/address/${addr}`}>{addr.slice(0, 12)}...</a>;

const table = [
  ['contract', 'Contract Address', ({ contractAddress: a }) => explorerLink(a)],
  ['owner', 'Contract Owner', ({ owner: a }) => explorerLink(a)],
  ['exchangeRate', 'Rate (Satoshis to Wei)'],
  ['timeLockBlocks', 'Time Lock Blocks'],
  ['minAmountSatoshis', 'Min Order (Satoshis)'],
  ['depositFeeSatoshis', 'Deposit Fee (Satoshis)'],
  ['rewardWei', 'Close Reward (Wei)'],
  ['supercavitationWei', 'Supercavitation (Wei)'],
  ['balance', 'Total Balance (Wei)'],
  ['lockedFunds', 'Locked Funds (Wei)'],
  ['version', 'Server Version'],
];

export default class Offering extends Component {
  constructor(props) {
    super(props);
    this.state = { };
  }
  componentDidMount() {
    this.getContractInfo();
  }
  async getContractInfo() {
    const { match: { params: { contractAddress } } } = this.props;
    this.setState({ ...await getContractInfo(contractAddress) }, this.getHttpInfo);
  }
  async getHttpInfo() {
    const { httpEndpoint } = this.state;
    try {
      this.setState({ ...await getOfferingInfo(httpEndpoint) });
    } catch (err) {
      this.setState({ err: true });
    }
  }
  render() {
    const { match: { params: { contractAddress } } } = this.props;
    const { text, name, err } = this.state;
    return (
      <div>
        <Link to="/registry">
          <Button text="Back to Registry" icon="arrow-left" />
        </Link>
        {(!text && !err) ? <Spinner />
          : (
            <div>
              <h2 style={{ marginBottom: 0 }}>{err ? 'Could not connect to swap invoice service...' : name}</h2>
              <h3 style={{ marginTop: 0 }}>{err ? 'The server is offline, but you can still settle existing swaps' : text}</h3>
              {err ? <InvoiceCreation contractAddress={contractAddress} offline />
                : (
                  <div className="row">
                    <div>
                      <HTMLTable bordered condensed striped>
                        <tbody>
                          {table.map(r => (
                            <tr key={r[0]}>
                              <th>{r[1]}</th>
                              <td>{(r[2] && r[2]({ ...this.state, contractAddress })) || this.state[r[0]]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </HTMLTable>
                    </div>
                    <div>
                      <InvoiceCreation contractAddress={contractAddress} {...this.state} />
                    </div>
                  </div>
                )
              }
            </div>
          )}
      </div>
    );
  }
}
