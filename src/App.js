import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import Home from './Home';
import Talk from './Talk';
import Dial from './Dial';
import NotFound from './NotFound';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/dial/:address/:relay" component={Dial} />
          <Route path="/talk/:address/:relay/:room/:encryptionKey" component={Talk} />

          <Route path="*" component={NotFound} />
        </Switch>
      </BrowserRouter>
    );
  }

}

export default App;
