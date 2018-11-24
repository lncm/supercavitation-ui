import React, { Component } from 'react';

export default class Timeout extends Component {
  constructor(props) {
    super(props);
    this.state = { };
  }
  render() {
    return (
      <div>
        Your contract timed out!
      </div>
    );
  }
}
