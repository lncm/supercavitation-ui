import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Callout, Button } from '@blueprintjs/core';

export default class Offering extends Component {
  render() {
    return (
      <div>
        <Callout title="Welcome to Supercavitation Swap Demo">
          Blah blah blah blah
          <br />
          <br />
          <Link to="/offering/">
            <Button text="Sample Offering" rightIcon="arrow-right" intent="success" />
          </Link>
        </Callout>
      </div>
    );
  }
}
