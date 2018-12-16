import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Callout, Card } from '@blueprintjs/core';

import { devContract } from '../config';

export default class Offering extends Component {
  render() {
    return (
      <div>
        <Callout title="Welcome to Supercavitation Swap Demo">
          Here are some sample swap offering contracts. This is currently a hard-coded list of contracts.
          <br />
          Eventually, this route will list contracts retreived from an on-chain registry.
        </Callout>
        <br />
        {devContract && (
          <Card>
            <b><Link to={`/offering/${devContract}`}>Dev Contract</Link></b>
            <br />
            {devContract}
          </Card>
        )}
        <Card>
          <b><Link to="/offering/0x8b3f82945f90e18cc235f829b59828d6ab4ad6e1">Bob</Link></b>
          <br />ARM, Paris
        </Card>
        <Card>
          <b><Link to="/offering/0x04cab45225e29b81ceb748890887b3cba65acd01">Charlie</Link></b>
          <br />x64, London
        </Card>
        <Card>
          <b><Link to="/offering/0x04cab45225e29b81ceb748890887b3cba65acd02">Some offline service</Link></b>
          <br />
          To show what it looks like when a contract is deployed but the server is offline
        </Card>
      </div>
    );
  }
}
