import React from 'react';
import { Component } from 'react';
import logo from '../assets/logo.png';
import Blocks from '../components/Blocks';
class App extends Component {

  state = { walletInfo: { address: 'foo-addr', balance: 9999 } };

  componentDidMount() {
    const api = 'http://localhost:3000/api/wallet-info';
    fetch(api)
      .then(response => response.json())
      .then(json => this.setState({ walletInfo: json }));
  }

  // render() {
  //   return(<div>hello</div>);
  // }

  render() {
    const { address, balance } = this.state.walletInfo;
    return (
      <div className='App'>
        <img className='logo' src={logo}></img>
        <br />
        <div className='WalletInfo'>
          <div>Address: {address}</div>
          <div>Balance: {balance}</div>
        </div>
        <hr />
        <Blocks />
      </div>
    );
  }
}

export default App;
