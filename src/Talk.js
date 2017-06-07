import React, { Component } from 'react';
import {withRouter} from 'react-router-dom';
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
    this.setState({status: this.props.match.params.address});
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

  setTimeout(() => this.props.history.push('/'), 1000);

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

      const speakerAnalyzer = audioContext.createScriptProcessor(1024,1,1);
      const bufferSource = audioContext.createBufferSource();

      source.connect(analyser);

      analyser.onaudioprocess = (audio) => {
    	  var arrayBuffer = encryptAudio(audio);
    	  socket.emit('audioBuffer', arrayBuffer);
      };

      bufferSource.connect(speakerAnalyzer);

      speakerAnalyzer.onaudioprocess = (audio) => {
    	  decryptAudio(audio);
      };

      socket.on('communicate', function(data){
    	  var viewBuffer = new Float32Array(data);
    	  console.log(data);
//    	  audioContext.decodeAudioData(data, function(buffer) {
//    		  bufferSource.buffer = buffer;
//    		  bufferSource.connect(audioContext.destination);
//    		  bufferSource.loop = true;
//	      });
      });

      analyser.connect(audioContext.destination);

      console.log(analyser);
//      audio.src = window.URL.createObjectURL(source.mediaStream);
      console.log(stream);
    }
  });
}

function encryptAudio(audio) {
	var inputBuffer = audio.inputBuffer;

	var arrayBuffer = new ArrayBuffer(4096);
	var viewBuffer = new Float32Array(arrayBuffer);

	for (var channel = 0; channel < inputBuffer.numberOfChannels; channel++) {
	    var inputData = inputBuffer.getChannelData(channel);

	    for (var sample = 0; sample < inputBuffer.length; sample++) {
	    	// encrypt the data here
	    	viewBuffer[sample] = inputData[sample];
	    }
	}
	return arrayBuffer;
}

function decryptAudio(data) {
//	var chunk = [];
//
//	for (var channel = 0; channel < data.length; channel++) {
//		chunk[channel] = [];
//
//	    for (var sample = 0; sample < data[channel].length; sample++) {
//	    	chunk[channel][sample] = data[sample];
//	    }
//	}
//	return chunk;
}


export default withRouter(Talk);
