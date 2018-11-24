import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

import Account from './Account';
import Offering from './Offering';

export default () => {
  return (
    <div>
      <h2 id="heading">Hello World</h2>
      <Account>
        <Switch>
          <Route path="/offering/:contractAddress" component={Offering} />
          <Redirect from="/" to="/offering/0xef899220a9f3ee569e5b629b655991f8bcebe184" />
        </Switch>
      </Account>
    </div>
  );
};
