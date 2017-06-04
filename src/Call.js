import React, { Component } from 'react';
import io from 'socket.io-client';
import ss from 'socket.io-stream';
import {Button, Progress} from 'semantic-ui-react';
import getUserMedia from 'getusermedia';
import Wispa from './Util/Wispa';
import './Call.css';

let audioStream;
let audioContext;

let identity;

class Call extends Component {
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

    } else {
      // but for the hackathon we'll assume there is one :)

      window.web3.shh.newIdentity((err, identity) => {
        call(window.web3, this.props.match.params.address, identity, this.refs.audio);

      });
    }
  }
  componentWillUnmount() {
    endCall.bind(this)();
  }
  render() {
    return (
      <div className="Call">
        <div className="content">
          <div className="contentContainer">
            <div className="progressContainer">
              <Progress value={this.state.progress} total={5} active={this.state.progress < 5} color={this.state.color} inverted>
                { this.state.status }
              </Progress>
            </div>
            <Button inverted color="red" onClick={endCall.bind(this)}>End Call</Button>
          </div>
        </div>
        <audio ref="audio" autoPlay></audio>
      </div>
    );
  }
}

function endCall() {
  console.log("Ending call");
  if (audioStream) {
    audioStream.getTracks()[0].stop();
  }
  if (audioContext) {
    audioContext.close();
  }

  this.setState({
    progress: 5,
    status: 'Call Ended',
    color: 'red',
  })
}


function call(web3, addr, identity, audio) {
  console.log("Calling "+addr);

  Wispa.makeCall(web3, addr, identity, (reply) => {
    console.log(reply);
  });

  // startAudioStream(audio);
}

function startAudioStream(audio) {
  const socket = io("http://localhost:8642");

  getUserMedia({audio: true}, (err, stream) => {
    if (err) {
      console.log(err);
      console.log("Whoops!");
    } else {
      console.log("yay!");
      audioStream = stream;
      audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(audioStream);
      const analyser = audioContext.createScriptProcessor(1024,1,1);

      source.connect(analyser);

      analyser.onaudioprocess = (audio) => {
    	  ss(socket).emit('audioBuffer', audio.inputBuffer.getChannelData(0));
      };

      analyser.connect(audioContext.destination);

      console.log(analyser);
      audio.src = window.URL.createObjectURL(source.mediaStream);
      console.log(stream);
    }
  });
}


export default Call;
