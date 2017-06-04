import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import Wispa from './Util/Wispa.js';

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
    if (typeof window.web3 === 'undefined' || typeof window.web3.currentProvider === 'undefined') {
      // there is no web3 impl, we should add one. Maybe.

    } else {
      // but for the hackathon we'll assume there is one :)
      window.web3.shh.newIdentity((err, identity) => {
        if (err) {
          console.log(err);
        } else {
          Wispa.listenForCalls(window.web3, identity, (caller, relayAddr, room, key) => {
            this.context.router.transitionTo('/talk/' + caller + '/' + relayAddr + '/' + room + '/' + key);
          });
        }
      });
    }
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
            <Button as={Link} to={'/dial/'+this.state.address} inverted size="huge" color="green" >Call</Button>
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
