import React, { Component } from 'react';
import getUserMedia from 'getusermedia';
import './App.css';

class App extends Component {
  componentDidMount() {
    getUserMedia({audio: true}, (err, stream) => {
      if (err) {
        console.log(err);
        console.log("Whoops!");
      } else {
        console.log("yay!");
        const context = new AudioContext();
        const source = context.createMediaStreamSource(stream);
        const analyser = context.createScriptProcessor(1024,1,1);

        analyser.onaudioprocess = (a) => {
          console.log(a);
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
        <div>
          Hello
        </div>
        <audio ref="audio" autoPlay></audio>
      </div>
    );
  }
}

export default App;
