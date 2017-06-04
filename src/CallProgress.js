import React, {Component} from 'react';
import {Button, Progress} from 'semantic-ui-react';
import './CallProgress.css';

class CallProgress extends Component {
  render() {
    return (
      <div className="contentContainer">
        <div className="progressContainer">
          <Progress value={this.props.progress} total={this.props.total} active={this.props.progress < this.props.total} color={this.props.color} inverted>
            { this.props.status }
          </Progress>
        </div>
        <Button inverted color="red" onClick={this.props.endCall}>End Call</Button>
      </div>
    );
  }
}

export default CallProgress;
