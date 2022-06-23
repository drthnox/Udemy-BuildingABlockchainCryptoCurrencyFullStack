import React from 'react';
import { Component } from 'react';
import Block from './Block';
import { Link } from "react-router-dom";

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
    return (
      <div>
        <div><Link to='/'>Home</Link></div>
        <h3>Blocks</h3>
        {
          this.state.blocks.map(block => {
            return (
              <Block key={block.hash} block={block} />
            );
          })
        }
      </div>
    );
  }

}

export default Blocks;