import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Callout, Spinner, Button } from '@blueprintjs/core';

import { getContractInfo } from '../api/web3';
import { getOfferingInfo } from '../api/http';

import InvoiceCreation from './InvoiceCreation';
import OfferingTable from './OfferingTable';

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
    const { httpEndpoint, owner } = this.state;
    try {
      this.setState({ ...await getOfferingInfo(httpEndpoint, owner) });
    } catch (err) {
      this.setState({ err: true });
    }
    this.setState({ ready: true });
  }
  renderOffering() {
    const { match: { params: { contractAddress } } } = this.props;
    const { err, text, name } = this.state;
    return (
      <div className="content">
        <Callout
          title={err ? 'Could not connect to swap invoice service...' : name}
          intent={err ? 'danger' : 'success'}
          icon={err ? 'error' : 'exchange'}
        >
          {err ? 'The server is offline, but you can still settle existing swaps' : text}
        </Callout>
        <div className="columns">
          {!err && <OfferingTable {...this.state} contractAddress={contractAddress} />}
          <InvoiceCreation contractAddress={contractAddress} offline={err} {...this.state} />
        </div>
      </div>
    );
  }
  render() {
    const { ready } = this.state;
    return (
      <div>
        <Link to="/registry">
          <Button text="Back to Registry" icon="arrow-left" />
        </Link>
        {ready ? this.renderOffering() : <Spinner />}
      </div>
    );
  }
}
