import React, { Component } from 'react';
import {Link, withRouter} from 'react-router-dom';
import Sound from 'react-sound';
import Wispa from './Util/Wispa.js';

import {Input, Button, List, Message, Icon} from 'semantic-ui-react';
import './Home.css';

class Home extends Component {
  constructor() {
    super();
    this.state = {
      address: '',
      relays: [],
      caller: null,
      callback: () => '',
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
    Wispa.listenForCalls(window.web3, (caller, callback) => {
      this.setState({caller, callback});

    }, (caller, relayAddr, room, key) => {
      this.props.history.push('/talk/' + caller + '/' + relayAddr + '/' + room + '/' + key);
    });

    Wispa.listenForRelays(window.web3, (evt, relayAddr) => {
      if (this.state.relays.indexOf(relayAddr) === -1) {
        if (evt === 'connect') {
          this.state.relays.push(relayAddr)
        }
      } else {
        if (evt === 'disconnect') {
          const index = this.state.relays.indexOf(relayAddr);
          this.state.relays.splice(index, 1);
        }
      }

      this.setState({relays: this.state.relays});
    });
  }

  componentWillUnmount() {
    Wispa.cancelAll();
  }

  callback(val) {
    this.setState({caller: null});
    this.state.callback(val);
  }

  render() {
    return (
      <div className="Home">
        {
          this.state.caller &&
          <div>
            <Message success icon>
              <Icon name='call'/>
              <Message.Header>
                Incoming call!
              </Message.Header>
              {this.state.caller}
            </Message>
            <Button.Group attached="bottom">
              <Button color='green' onClick={this.callback.bind(this, true)}>Accept</Button>
              <Button color='red' onClick={this.callback.bind(this, false)}>Decline</Button>
            </Button.Group>
            <Sound playStatus={Sound.status.PLAYING} url='/ring.mp3' onFinishedPlaying={this.callback.bind(this, false)}></Sound>
          </div>
        }
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
