import React, { createContext, useEffect } from "react";
import { Router, Switch, Route, Redirect } from "react-router-dom";
import { createBrowserHistory } from "history";
import { AboutPage, HomePage, LegalPage } from "../pages";
import GameRouter from "../GameRouter";
import "./App.css";

const browserHistory = createBrowserHistory();
export const BrowserHistoryContext = createContext(browserHistory);

function App() {
  useEffect(() => {
    document.title = "Nerds Oppose Society";
  }, []);
  return (
    <Router history={browserHistory}>
      <main>
        <Switch>
          <Route exact path="/">
            <HomePage />
          </Route>

          <Route exact path="/about">
            <AboutPage />
          </Route>

          <Route exact path="/legal">
            <LegalPage />
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
      </main>
    </Router>
  );
}

export default App;
