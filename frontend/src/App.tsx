import React from "react";
import "./App.css";
import { Switch, Route } from "react-router-dom";
import BasicPage from "./BasicPage";

function App() {
  return (
    <Switch>
      <Route path="/:gameCode">
        <BasicPage />
      </Route>

      <Route path="/">
        <p>Home</p>
      </Route>
    </Switch>
  );
}

export default App;
