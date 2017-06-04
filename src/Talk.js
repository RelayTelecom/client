import React, { Component } from 'react';
import io from 'socket.io-client';
import ss from 'socket.io-stream';
import getUserMedia from 'getusermedia';
import CallProgress from './CallProgress';
import './Talk.css';

let audioStream;
let audioContext;

class Talk extends Component {
  constructor() {
    super();

    this.state = {
      status: 'Calling...',
      color: 'green',
    }
  }
  componentDidMount() {
    this.setState({status: 'Talking with ' + this.props.match.params.address});
    const relayAddr = this.props.match.params.relay;
    const room = this.props.match.params.room;
    const encryptionKey = this.props.match.params.encryptionKey;

    startAudioStream(relayAddr, room, encryptionKey, this.refs.audio);
  }
  componentWillUnmount() {
    endCall.bind(this)();
  }
  render() {
    return (
      <div className="Talk">
        <div className="content">
          <CallProgress progress={5} total={5} color={this.state.color} status={this.state.status} endCall={endCall.bind(this)}/>
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
    status: 'Call Ended',
    color: 'red',
  });
}

function startAudioStream(relayAddr, room, encryptionKey, audio) {
  const socket = io(relayAddr);
  socket.emit('joinRoom', room);

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


export default Talk;