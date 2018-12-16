import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Navbar, Alignment } from '@blueprintjs/core';

import { appTitle } from '../config';

import Web3Connection from './Web3Connection';
import AccountBalance from './AccountBalance';
import Registry from './Registry';
import Offering from './Offering';


export default () => {
  return (
    <div className="container">
      <Web3Connection>
        <Navbar>
          <Navbar.Group align={Alignment.LEFT}>
            <Navbar.Heading>{appTitle}</Navbar.Heading>
          </Navbar.Group>
          <Navbar.Group align={Alignment.RIGHT}>
            <AccountBalance />
          </Navbar.Group>
        </Navbar>
        <div className="content">
          <Switch>
            <Route path="/registry/:contractAddress" component={Registry} />
            <Route path="/offering/:contractAddress" component={Offering} />
            <Redirect from="/offering" to="/registry" />
            <Redirect from="/registry" to="/registry/0x1234" />
            <Redirect from="/" to="/registry/0x1234" />
          </Switch>
        </div>
      </Web3Connection>
    </div>
  );
};
