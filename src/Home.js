import React, { Component } from 'react';
import {Link, withRouter} from 'react-router-dom';
import Wispa from './Util/Wispa.js';

import {Input, Button, List} from 'semantic-ui-react';
import './Home.css';

class Home extends Component {
  constructor() {
    super();
    this.state = {
      address: '',
      relays: [],
    }
  }
  componentDidMount() {
    if (typeof window.web3 === 'undefined' || typeof window.web3.currentProvider === 'undefined') {
      // there is no web3 impl, we should add one. Maybe.
      setTimeout(() => {
        if (typeof window.web3 === 'undefined') {
          // If still undefined..
          this.setState({
            color: 'red',
            status: 'No Web3 detected. Please download at metamask.io',
          });
        } else {
          this.setup();
        }
      }, 3000);
    } else {
      // but for the hackathon we'll assume there is one :)
      this.setup()

    }
  }

  setup() {
    Wispa.listenForCalls(window.web3, 'something', (caller, relayAddr, room, key) => {
      this.props.history.push('/talk/' + caller + '/' + relayAddr + '/' + room + '/' + key);
    });

    Wispa.listenForRelays(window.web3, (relayAddr) => {
      if (this.state.relays.indexOf(relayAddr) === -1) {
        this.state.relays.push(relayAddr)
        this.setState({relays: this.state.relays});
      }
    });
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
            <Button as={Link} to={'/dial/'+this.state.address+'/'+this.state.relays[0]} inverted size="huge" color="green" >Call</Button>
          </div>

          <List className="relayContainer" inverted>
            {
              this.state.relays.map((relay) => {
                return <List.Item key={relay}>
                  <div className="sonar-wrapper image">
                    <div className="sonar-emitter"></div>
                  </div>
                  <List.Content verticalAlign="middle">
                    <List.Header>{relay}</List.Header>
                  </List.Content>
                </List.Item>
              })
            }
          </List>
        </div>

      </div>
    );
  }

  handleChange(attr, e) {
    const newState = {};
    newState[attr] = e.target.value;
    this.setState(newState);
  }
}

export default withRouter(Home);
