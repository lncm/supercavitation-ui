import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Navbar, Alignment } from '@blueprintjs/core';

import { appTitle, devContract } from '../config';

import Web3Connection from './Web3Connection';
import Registry from './Registry';
import Offering from './Offering';

export default () => {
  return (
    <div className="container">
      <Navbar>
        <Navbar.Group align={Alignment.LEFT}>
          <Navbar.Heading>{appTitle}</Navbar.Heading>
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
            User info here
          {/* {this.renderAccountBalance()} */}
        </Navbar.Group>
      </Navbar>
      <div className="content">
        <Web3Connection>
          <Switch>
            <Route path="/registry/:contractAddress" component={Registry} />
            <Route path="/offering/:contractAddress" component={Offering} />
            <Redirect from="/offering" to={`/offering/${devContract}`} />
            <Redirect from="/registry" to="/registry/0x1234" />
            <Redirect from="/" to="/registry/0x1234" />
          </Switch>
        </Web3Connection>
      </div>
    </div>
  );
};
