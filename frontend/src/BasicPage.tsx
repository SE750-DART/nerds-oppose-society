import React, { useContext } from "react";
import { useHistory } from "react-router-dom";
import { BrowserHistoryContext } from "./App";

type Props = {
  path: string;
  gameCode: string;
};

const BasicPage = ({ path, gameCode }: Props) => {
  const memoryHistory = useHistory();
  const browserHistory = useContext(BrowserHistoryContext);

  return (
    <>
      <p>Gamecode: {gameCode}</p>
      <p>Path: {path}</p>
      <button type="button" onClick={() => memoryHistory.push("/nickname")}>
        nickname
      </button>
      <button type="button" onClick={() => memoryHistory.push("/lobby")}>
        lobby
      </button>
      <button type="button" onClick={() => memoryHistory.push("/preRound")}>
        preRound
      </button>
      <button
        type="button"
        onClick={() => memoryHistory.push("/submitPunchline")}
      >
        submitPunchline
      </button>
      <button
        type="button"
        onClick={() => memoryHistory.push("/selectPunchline")}
      >
        selectPunchline
      </button>
      <button type="button" onClick={() => memoryHistory.push("/postRound")}>
        postRound
      </button>
      <button type="button" onClick={() => memoryHistory.push("/scoreboard")}>
        scoreboard
      </button>
      <button type="button" onClick={() => browserHistory.push("/")}>
        home
      </button>
    </>
  );
};

export default BasicPage;
