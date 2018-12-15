import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Callout, Button, Card } from '@blueprintjs/core';

export default class Offering extends Component {
  render() {
    return (
      <div>
        <Callout title="Welcome to Supercavitation Swap Demo">
          Here are some sample swap offering contracts. This page will pull the contract addresses from an on-chain registry.
        </Callout>
        <Card>
          <h3>
            <Link to="/offering/0x8b3f82945f90e18cc235f829b59828d6ab4ad6e1">Bob</Link>
            <br />ARM, Paris
          </h3>
        </Card>
        <Card>
          <h3>
            <Link to="/offering/0x04cab45225e29b81ceb748890887b3cba65acd01">Charlie</Link>
            <br />x64, London
          </h3>
        </Card>
        <Card>
          <h3>
            <Link to="/offering/0x04cab45225e29b81ceb748890887b3cba65acd02">Some Offline Service</Link>
          </h3>
        </Card>
      </div>
    );
  }
}
