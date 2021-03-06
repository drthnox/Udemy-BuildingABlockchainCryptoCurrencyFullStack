import React from 'react';
import { Component } from 'react';
import logo from '../assets/logo.png';
import { Link } from "react-router-dom";
import ConductTransaction from './ConductTransaction';
import Blocks from './Blocks';

class App extends Component {

  state = { walletInfo: { address: 'foo-addr', balance: 9999 } };

  componentDidMount() {
    const api = `${document.location.origin}/api/wallet-info`;
    fetch(api)
      .then(response => response.json())
      .then(json => this.setState({ walletInfo: json }));
  }

  render() {
    const { address, balance } = this.state.walletInfo;
    return (
      <div className='App'>
        <img className='logo' src={logo}></img>
        <br />
        <div><Link to='/blocks'>Blocks</Link></div>
        <div><Link to='/conduct-transaction'>Conduct a Transaction</Link></div>
        <div><Link to='/transaction-pool'>Transaction Pool</Link></div>
        <br />
        <div className='WalletInfo'>
          <div>Address: {address}</div>
          <div>Balance: {balance}</div>
        </div>
      </div>
    );
  }
}

export default App;
