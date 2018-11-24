import React, { Component } from 'react';
import { getContractInfo } from '../web3';
import { getSwapInfo } from '../http';

import InvoiceCreation from './InvoiceCreation';

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
    this.setState({ contract: await getContractInfo(contractAddress) }, this.getHttpInfo);
  }
  async getHttpInfo() {
    const { contract: { httpEndpoint } } = this.state;
    this.setState({ swap: await getSwapInfo(httpEndpoint) });
  }
  render() {
    const { match: { params: { contractAddress } } } = this.props;
    const { contract, swap } = this.state;
    return (
      <div>
        <hr />
        Offering <b>{contractAddress}</b>
        <br />
        {<pre>{JSON.stringify(this.state, null, 2)}</pre>}
        <hr />
        {
          (contract && swap)
          && <InvoiceCreation contractAddress={contractAddress} {...contract} {...swap} />
        }
      </div>
    );
  }
}
