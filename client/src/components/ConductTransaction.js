import React from 'react';
import { Component } from 'react';
import { FormGroup, Button, FormControl } from 'react-bootstrap';
import { Link } from 'react-router-dom';

class ConductTransaction extends Component {

  state = { recipient: '', amount: 0 };

  // 'event' will be populated from onChange() from form control
  updateRecipient = (event) => {
    this.setState({ recipient: event.target.value });
  };

  // 'event' will be populated from onChange() from form control
  updateAmount = (event) => {
    this.setState({ amount: Number(event.target.value) });
  };

  conductTransaction = () => {
    const { recipient, amount } = this.state;
    const api = "http://localhost:3000/api/transact";

    fetch(api,
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({recipient, amount})
      }).then((response) => {response.json()})
      .then((json) => {
        alert(json.message || json.type);
      });
  };

  render() {
    console.log('this.state=', this.state);
    return (
      <div className='ConductTransaction'>
        <Link to='/'>Home</Link>
        <h3>Conduct a Transaction</h3>
        <FormGroup>
          <FormControl
            input="text"
            placeholder="recipient"
            value={this.state.recipient}
            onChange={this.updateRecipient}
          />
        </FormGroup>
        <FormGroup>
          <FormControl
            input="number"
            placeholder="amount"
            value={this.state.amount}
            onChange={this.updateAmount}
          />
        </FormGroup>
        <div>
          <Button variant="danger" onClick={this.conductTransaction}>Submit</Button>
        </div>
      </div>
    );
  }

};

export default ConductTransaction;