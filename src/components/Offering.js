import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Spinner, Button, HTMLTable } from '@blueprintjs/core';
import { explorerUrl } from '../util';

import { getContractInfo } from '../web3';
import { getOfferingInfo } from '../http';

import InvoiceCreation from './InvoiceCreation';

// const fields = [
//   ''
// ]

const explorerLink = addr => <a href={`${explorerUrl}/address/${addr}`}>{addr.slice(0, 12)}...</a>;

const table = [
  ['contract', 'Contract Address', ({ contractAddress: a }) => explorerLink(a)],
  ['owner', 'Contract Owner', ({ owner: a }) => explorerLink(a)],
  ['lockedFunds', 'Locked Funds'],
  ['balance', 'Total Balance'],
  ['minAmount', 'Minimum Order'],
  ['timeLockNumber', 'Blocks Time Lock'],
  ['depositFee', 'Deposit Fee'],
  ['exchangeRate', 'Exchange Rate'],
  ['reward', 'Redemption Reward'],
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
    this.setState({ ...await getOfferingInfo(httpEndpoint) });
  }
  render() {
    const { match: { params: { contractAddress } } } = this.props;
    const { text, httpEndpoint } = this.state;
    return (
      <div>
        <Link to="/registry">
          <Button text="Back to Registry" icon="arrow-left" />
        </Link>
        {!text ? <Spinner />
          : (
            <div>
              <h2>
                {text}
                <small><br />{httpEndpoint}</small>
              </h2>
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
            </div>
          )}
      </div>
    );
  }
}
