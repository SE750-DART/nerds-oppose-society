import React, { createContext } from "react";
import { Router, Switch, Route, Redirect } from "react-router-dom";
import { createBrowserHistory } from "history";
import HomePage from "./HomePage";
import GameRouter from "./GameRouter";
import "./App.css";

const browserHistory = createBrowserHistory();
export const BrowserHistoryContext = createContext(browserHistory);

function App() {
  return (
    <Router history={browserHistory}>
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

      <p data-testid="test" style={{ display: "none" }}>
        test
      </p>
    </Router>
  );
}

export default App;
