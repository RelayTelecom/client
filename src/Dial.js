import React, { Component } from 'react';
import Wispa from './Util/Wispa';
import {withRouter} from 'react-router-dom';

import CallProgress from './CallProgress';
import './Dial.css';

class Dial extends Component {
  constructor() {
    super();

    this.state = {
      status: 'Calling...',
      progress: 1,
      color: 'green',
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
      this.setup();
    }
  }
  setup() {
    call.bind(this)(window.web3, this.props.match.params.address, this.props.match.params.relay, (p) => this.setState({progress: p}));

  }
  componentWillUnmount() {
    endCall.bind(this)();
  }
  render() {
    return (
      <div className="Dial">
        <div className="content">
          <CallProgress progress={this.state.progress} total={5} color={this.state.color} status={this.state.status} endCall={endCall.bind(this)}/>
        </div>
      </div>
    );
  }
}

function endCall() {
  console.log("Ending call");

  this.setState({
    progress: 5,
    status: 'Call Ended',
    color: 'red',
  })
}

function call(web3, addr, relay, progress) {
  Wispa.makeCall(web3, addr, relay, progress, (callee, relayAddr, room, key) => {
    this.props.history.push('/talk/' + callee + '/' + relayAddr + '/' + room + '/' + key);
  });
}

export default withRouter(Dial);
