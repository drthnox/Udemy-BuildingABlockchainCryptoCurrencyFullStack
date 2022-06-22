import React from 'react';
import { Component } from 'react';


class Blocks extends Component {

  state = { blocks: [] };

  componentDidMount() {
    const api = 'http://localhost:3000/api/blocks';
    fetch(api)
      .then(response => response.json()
        .then(json => this.setState({ blocks: json }))
      );
  }

  render() {
    console.log('this.state=', this.state);
    return(
      <div>
        <h3>Blocks</h3>
        <div></div>
      </div>
    );
  }

}

export default Blocks;