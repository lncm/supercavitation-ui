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
          <Redirect from="/" to="/offering/0x06abca59271b06e09f1ec891298e8bd97878779c" />
        </Switch>
      </Account>
    </div>
  );
};
