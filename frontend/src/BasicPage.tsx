import React from "react";
import { useHistory } from "react-router-dom";

type Props = {
  path: string;
  gameCode: string;
  browserHistory: any;
};

const BasicPage = ({ path, gameCode, browserHistory }: Props) => {
  const history = useHistory();

  return (
    <>
      <p>Gamecode: {gameCode}</p>
      <p>Path: {path}</p>
      <button type="button" onClick={() => history.push("/nickname")}>
        nickname
      </button>
      <button type="button" onClick={() => history.push("/lobby")}>
        lobby
      </button>
      <button type="button" onClick={() => history.push("/preRound")}>
        preRound
      </button>
      <button type="button" onClick={() => history.push("/submitPunchline")}>
        submitPunchline
      </button>
      <button type="button" onClick={() => history.push("/selectPunchline")}>
        selectPunchline
      </button>
      <button type="button" onClick={() => history.push("/postRound")}>
        postRound
      </button>
      <button type="button" onClick={() => history.push("/scoreboard")}>
        scoreboard
      </button>
      <button type="button" onClick={() => browserHistory.push("/")}>
        home
      </button>
    </>
  );
};

export default BasicPage;
