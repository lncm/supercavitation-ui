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
          <Redirect from="/" to="/offering/0xa8eeafc678a66c123654695ac6217c307f8285bc" />
        </Switch>
      </Account>
    </div>
  );
};
