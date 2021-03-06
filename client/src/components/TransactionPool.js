import React from 'react';
import { Component } from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Transaction from './Transaction';
import history from '../history';

const POLL_INTERVAL_MS = 10000;

class TransactionPool extends Component {

  state = { transactionPoolMap: {} };

  componentDidMount() {
    this.fetchTransactionPoolMap();
    this.fetchTransactionPoolMapInterval = setInterval(() => {
      this.fetchTransactionPoolMap(),
      POLL_INTERVAL_MS
    });
  }

  componentWillUnmount() {
    clearInterval(this.fetchTransactionPoolMapInterval);
  }

  fetchTransactionPoolMap = () => {
    const api = `${document.location.origin}/api/transaction-pool-map`;
    const requestOptions = {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    };
    fetch(api, requestOptions)
      .then(response => response.json())
      .then(json => this.setState({ transactionPoolMap: json }))
      ;
  }

  fetchMineTransactions = () => {
    const api = `${document.location.origin}/api/mine-transaction`;
    const requestOptions = {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    };
    fetch(api, requestOptions)
      .then(response => {
        if(response.status == 200) {
          alert('success');
          history.push('/blocks');
          history.go(0);
        } else {
          alert('The mine-transactions block did not complete');
        }
      });
  }

  render() {
    return (
      <div className='TransactionPool'>
        <div><Link to='/'>Home</Link></div>
        <h3>Transaction Pool</h3>
        {
          Object.values(this.state.transactionPoolMap)
            .map(transaction => {
              return(
                <div key={transaction.id}>
                  <hr />
                  <Transaction transaction={transaction} />
                </div>
              );
            })
        }
        <hr />
        <Button variant="danger" onClick={this.fetchMineTransactions}>
          Mine Transaction
        </Button>
      </div>
    );
  }

}

export default TransactionPool;