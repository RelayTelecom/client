import React, { Component } from 'react';
import {withRouter} from 'react-router-dom';
import io from 'socket.io-client';
import ss from 'socket.io-stream';
import getUserMedia from 'getusermedia';
import CallProgress from './CallProgress';
import './Talk.css';

let audioStream;
let audioContext;
let socket;

const bufferSize = 1024;
const sampleFrames = 22050;
const sampleRate = sampleFrames * 2;
const bufferUnderflowSleepDurationMillis = 10;
var frameCount = 0;
var playing = false;
var audioBuffers = [];
var currentBuffer;

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
          <CallProgress progress={5} total={5} color={this.state.color} status={this.state.status} endCall={stopCall.bind(this)}/>
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
      audioContext.close().catch(err => 'lol error handling..');

  }
  if (socket) {
    socket.removeAllListeners("audioBuffer");
  }

  setTimeout(() => this.props.history.push('/'), 1000);
}

function stopCall() {
    this.setState({
      status: 'Call Ended',
      color: 'red',
    });

    endCall.bind(this)();
}

function startAudioStream(relayAddr, room, encryptionKey, audio) {
  socket = io(relayAddr);
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
      const analyser = audioContext.createScriptProcessor(bufferSize,1,1);
      currentBuffer = audioContext.createBuffer(1, sampleFrames, sampleRate);

      source.connect(analyser);

      analyser.onaudioprocess = (audio) => {
    	  var arrayBuffer = encryptAudio(audio);
    	  socket.emit('audioBuffer', arrayBuffer);
      };

      socket.on('communicate', function(data){
    	  var viewBuffer = new Float32Array(data);
    	  decodeAudio(viewBuffer);
      });

      analyser.connect(audioContext.destination);
    }
  });
}

function encryptAudio(audio) {
	var inputBuffer = audio.inputBuffer;

	var arrayBuffer = new ArrayBuffer(4096);
	var viewBuffer = new Float32Array(arrayBuffer);

	for (var channel = 0; channel < inputBuffer.numberOfChannels; channel++) {
	    var inputData = inputBuffer.getChannelData(channel);

	    for (var sample = 0; sample < bufferSize; sample++) {
	    	// encrypt the data here
	    	viewBuffer[sample] = inputData[sample];
	    }
	}
	return arrayBuffer;
}

function decodeAudio(audioArray) {
    var audioData = currentBuffer.getChannelData(0);

    for (var sample = 0; sample < bufferSize; sample++) {
    	// decrypt the data here
    	audioData[frameCount] = audioArray[sample];
    	frameCount++;
    	if(frameCount == sampleFrames) {
    		frameCount = 0;
    		shiftAudioBuffer();
    	}
    }
}

function shiftAudioBuffer() {
	var bufferToBePushed = currentBuffer;
	audioBuffers.push(bufferToBePushed);
	currentBuffer = audioContext.createBuffer(1, sampleFrames, sampleRate);

	if(!playing) {
		playing = true;
		playAudio();
	}
}

function playAudio() {
	if (audioBuffers.length > 0) {
		var source = audioContext.createBufferSource();

		source.buffer = audioBuffers.shift();
		source.connect(audioContext.destination);

		source.onended = playAudio;
		source.start();
	} else {
		setTimeout(playAudio, bufferUnderflowSleepDurationMillis);
	}
}


export default withRouter(Talk);
