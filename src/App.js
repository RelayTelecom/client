import React, { Component } from 'react';
import io from 'socket.io-client';
import {Input, Button} from 'semantic-ui-react';
import getUserMedia from 'getusermedia';
import './App.css';

class App extends Component {
  componentDidMount() {
    //const socket = io("http://localhost:8642");

    getUserMedia({audio: true}, (err, stream) => {
      if (err) {
        console.log(err);
        console.log("Whoops!");
      } else {
        console.log("yay!");
        const context = new AudioContext();
        const source = context.createMediaStreamSource(stream);
        const analyser = context.createScriptProcessor(1024,1,1);

        analyser.onaudioprocess = (audio) => {
          //socket.emit('audioBuffer', audio.outputBuffer);
        };

        analyser.connect(context.destination);

        console.log(analyser);
        this.refs.audio.src = window.URL.createObjectURL(source.mediaStream);
        console.log(stream);
      }
    });
  }

  render() {
    return (
      <div className="App">
        <div className="content">
          <div className = "logoContainer">
            <h1>Relay</h1>
          </div>
          <div className="callContainer">
            <Input size="huge" placeholder="Address"></Input>
            <Button inverted size="huge" color="green" >Call</Button>
          </div>
        </div>
        <audio ref="audio" autoPlay></audio>
      </div>
    );
  }
}

export default App;
