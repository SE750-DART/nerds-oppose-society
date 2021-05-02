import React, { useState, createContext } from "react";
import { Router, Switch, Route, Redirect } from "react-router-dom";
import { createBrowserHistory } from "history";
import HomePage from "./HomePage";
import GameRouter from "./GameRouter";
import Button from "./components/Button";
import TextField from "./components/TextField";
import PlayerList from "./components/PlayerList";
import "./App.css";

const browserHistory = createBrowserHistory();
export const BrowserHistoryContext = createContext(browserHistory);

function App() {
  const [testText, setTestText] = useState("");

  const clickBtn = () => {
    // eslint-disable-next-line
    console.log("Beep, boop");
  };

  const logTextField = () => {
    // eslint-disable-next-line
    console.log(testText);
  };

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

      <div className="main">
        <TextField
          label="Game code"
          textValue={testText}
          onChangeHandler={setTestText}
        />
        <br />
        <Button text="Join game" handleOnClick={logTextField} />
        <br />
        <Button
          variant="secondary"
          size="small"
          text="Copy"
          handleOnClick={clickBtn}
        />
        <br />
        <Button
          variant="secondary"
          text="Start new game"
          handleOnClick={clickBtn}
        />
        <br />
        <TextField
          label="Score"
          textValue={testText}
          size="small"
          onChangeHandler={setTestText}
          disabled
        />
        <br />
        <PlayerList gameState="lobby" />
      </div>
    </Router>
  );
}

export default App;
