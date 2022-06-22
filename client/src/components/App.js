import React from 'react';
import { Component } from 'react';

class App extends Component {

  state = { walletInfo: { address: 'foo-addr', balance: 9999 } };

  render() {
    return (
      <div>
        hello
        <div>Wallet Info:</div>
        {/* <div>Address: {address}</div> */}
        {/* <div>Balance: {balance}</div> */}
      </div>
    );
  }
}

export default App;
