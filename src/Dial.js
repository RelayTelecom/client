import React, { Component } from 'react';
import Wispa from './Util/Wispa';
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

      // But let's just wait a sec in case metamask is slow.
      setTimeout(() => {
        if (typeof window.web3 === 'undefined') {
          // If still undefined..
          this.setState({
            color: 'red',
            status: 'No Web3 detected. Please download at metamask.io',
          });
        }
        //window.web3.shh.newIdentity((err, identity) => {
        call(window.web3, this.props.match.params.address, (p) => this.setState({progress: p}));
        //});
      }, 1000);
    } else {
      // window.web3.shh.newIdentity((err, identity) => {
      call(window.web3, this.props.match.params.address, (p) => this.setState({progress: p}));
      // });
    }

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

function call(web3, addr, progress) {
  Wispa.makeCall(web3, addr, progress, (callee, relayAddr, room, key) => {
    this.context.router.transitionTo('/talk/' + callee + '/' + relayAddr + '/' + room + '/' + key);
  });
}

export default Dial;
