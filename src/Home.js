import React, { Component } from 'react';
import {Link} from 'react-router-dom';

import {Input, Button} from 'semantic-ui-react';
import './Home.css';

class Home extends Component {
  constructor() {
    super();
    this.state = {
      address: '',
    }
  }
  componentDidMount() {
  }
  render() {
    return (
      <div className="Home">
        <div className="content">
          <div className = "logoContainer">
            <h1>Relay</h1>
          </div>
          <div className="callContainer">
            <Input size="huge" placeholder="Address" onChange={this.handleChange.bind(this, 'address')}></Input>
            <Button as={Link} to={'/call/'+this.state.address} inverted size="huge" color="green" >Call</Button>
          </div>
        </div>
        <audio ref="audio" autoPlay></audio>
      </div>
    );
  }

  handleChange(attr, e) {
    const newState = {};
    newState[attr] = e.target.value;
    this.setState(newState);
  }
}

export default Home;
