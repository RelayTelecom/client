import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import Home from './Home';
import Call from './Call';
import NotFound from './NotFound';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/call/:address/" component={Call} />
          <Route path="/call/:address/:encryptionKey" component={Call} />
          <Route path="/call/:address/:encryptionKey/:relay" component={Call} />

          <Route path="*" component={NotFound} />
        </Switch>
      </BrowserRouter>
    );
  }

}

export default App;
