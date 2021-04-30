import React from "react";
import "./App.css";
import { Switch, Route, Redirect } from "react-router-dom";
import HomePage from "./HomePage";
import GameRouter from "./GameRouter";

function App() {
  return (
    <Switch>
      <Route exact path="/">
        <HomePage />
      </Route>

      <Route path="/:gameCode">
        <GameRouter />
      </Route>

      <Route path="*">
        <Redirect to="/" />
      </Route>
    </Switch>
  );
}

export default App;
