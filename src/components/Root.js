import React from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import App from './App';

export default () => {
  return (
    <Router>
      <Switch>
        <Route path="/" component={App} />
      </Switch>
    </Router>
  );
};
