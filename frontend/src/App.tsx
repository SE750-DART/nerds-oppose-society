import React, { useContext, useEffect } from "react";
import { Switch, Route, Redirect, useHistory } from "react-router-dom";
import { BrowserHistoryContext } from "./BrowserHistoryContextProvider";
import HomePage from "./HomePage";
import GameRouter from "./GameRouter";
import "./App.css";

function App() {
  const browserHistory = useHistory();
  const { setBrowserHistory } = useContext(BrowserHistoryContext);
  useEffect(() => setBrowserHistory(browserHistory), []);

  return (
    <>
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
    </>
  );
}

export default App;
