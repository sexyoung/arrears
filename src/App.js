import React from 'react';
import {
  Route,
  Switch,
  BrowserRouter as Router,
} from "react-router-dom";

import {
  HomePage,
  PopupPage,
} from 'pages';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/popup">
          <PopupPage />
        </Route>
        <Route path="/">
          <HomePage />
        </Route>
      </Switch>
    </Router>
  )
}

export default App
