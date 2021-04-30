import React from "react";
import "./App.css";
import { Switch, Route, Redirect, useHistory } from "react-router-dom";
import HomePage from "./HomePage";
import GameRouter from "./GameRouter";

function App() {
  const browserHistory = useHistory();

  return (
    <Switch>
      <Route exact path="/">
        <HomePage />
      </Route>

      <Route path="/:gameCode">
        <GameRouter browserHistory={browserHistory} />
      </Route>

      <Route path="*">
        <Redirect to="/" />
      </Route>
    </Switch>
  );
}

export default App;
