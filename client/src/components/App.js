import React from 'react';
import { Component } from 'react';
import Blocks from './Blocks';
import logo from '../assets/logo.png';
class App extends Component {

  state = { walletInfo: { address: 'foo-addr', balance: 9999 } };

  componentDidMount() {
    const api = 'http://localhost:3000/api/wallet-info';
    fetch(api)
      .then(response => response.json())
      .then(json => this.setState({walletInfo: json}))
      // .then(json => console.log('json=',json))
      ;
  }

  render() {
    const { address, balance } = this.state.walletInfo;
    return (
      <div>
        <img className='logo' src={logo}></img>
        <br />
        <div>Address: {address}</div>
        <div>Balance: {balance}</div>
        <br />
        <Blocks />
      </div>
    );
  }
}

export default App;
