import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Callout, Button, Card } from '@blueprintjs/core';

export default class Offering extends Component {
  render() {
    return (
      <div>
        <Callout title="Welcome to Supercavitation Swap Demo">
          Blah blah blah blah, this will be a registry
          <br />
          <br />
          <Link to="/offering/">
            <Button text="Sample Offering" rightIcon="arrow-right" intent="success" />
          </Link>
        </Callout>

        <Card>
          <h3>
            <Link to="/offering">Bob's Swaps</Link>
            <br/>https://lncm.github.io
          </h3>
          <p>
            User interfaces that enable people to interact smoothly with data, ask better questions, and make better decisions.
          </p>
        </Card>
        <Card>
          <h3>
            <Link to="/offering">Charles Lightning Swoppa</Link>
            <br/>https://lncm.github.io
          </h3>
          <p>
            User interfaces that enable people to interact smoothly with data, ask better questions, and make better decisions.
          </p>
        </Card>
        <Card>
          <h3>
            <Link to="/offering">Infinity Rule</Link>
            <br/>https://lncm.github.io
          </h3>
          <p>
            User interfaces that enable people to interact smoothly with data, ask better questions, and make better decisions.
          </p>
        </Card>

      </div>
    );
  }
}
