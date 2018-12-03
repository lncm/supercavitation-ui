import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import Registry from './Registry';
import Offering from './Offering';

export default () => {
  return (
    <div className="content">
      <Switch>
        <Route path="/registry/:contractAddress" component={Registry} />
        <Route path="/offering/:contractAddress" component={Offering} />
        <Redirect from="/offering" to="/offering/0xc62f1ce7aba9990000a71d7d99791026373e7021" />
        <Redirect from="/registry" to="/registry/0x1234" />
        <Redirect from="/" to="/registry/0x1234" />
      </Switch>
    </div>
  );
};
