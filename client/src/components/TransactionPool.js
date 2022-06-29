import React from 'react';
import { Component } from 'react';
import { Link } from 'react-router-dom';
import Transaction from './Transaction';

class TransactionPool extends Component {

  state = { transactionPoolMap: {} };

  componentDidMount() {
    this.fetchTransactionPoolMap();
  }

  fetchTransactionPoolMap = () => {
    const api = "http://localhost:3000/api/transaction-pool-map";
    const requestOptions = {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    };
    fetch(api, requestOptions)
      .then(response => response.json())
      .then(json => this.setState({ transactionPoolMap: json }))
      ;
  }

  render() {
    console.log('render(): values=', Object.values(this.state.transactionPoolMap));

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
      </div>
    );
  }

}

export default TransactionPool;