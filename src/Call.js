import React, { Component } from 'react';
import io from 'socket.io-client';
import {Button, Progress} from 'semantic-ui-react';
import getUserMedia from 'getusermedia';
import './Call.css';

let audioStream;
let audioContext;

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
    call(this.props.match.params.address, this.refs.audio);
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
              <Progress value={this.state.progress} total={5} active={this.state.progress < 5} color={this.state.color} inverted progress="ratio">
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

function call(addr, audio) {
  console.log("Calling "+addr);

  startAudioStream(audio);
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
        socket.emit('audioBuffer', audio.inputBuffer.getChannelData(0));
      };

      analyser.connect(audioContext.destination);

      console.log(analyser);
      audio.src = window.URL.createObjectURL(source.mediaStream);
      console.log(stream);
    }
  });
}

export default Call;
