import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import { BrowserHistoryContext } from "../../App";
import createGame from "../../api/createGame";
import validateGame from "../../api/validateGame";
import createPlayer from "../../api/createPlayer";

type Props = {
  path: string;
  gameCode: string;
};

const BasicPage = ({ path, gameCode }: Props) => {
  const memoryHistory = useHistory();
  const browserHistory = useContext(BrowserHistoryContext);

  const [gameCodeNew, setGameCodeNew] = useState(gameCode);
  const [apiResponse, setApiResponse] = useState("");

  const handleCreateGame = async () => {
    const res = await createGame();
    setApiResponse(JSON.stringify(res));

    if (res.success && res.data) {
      setGameCodeNew(res.data);
    }
  };

  const handleValidateGame = async (code: string) => {
    const res = await validateGame({ gameCode: code });
    setApiResponse(JSON.stringify(res));
  };

  const handleCreatePlayer = async (code: string, nickname: string) => {
    const res = await createPlayer({
      gameCode: code,
      nickname,
    });
    setApiResponse(JSON.stringify(res));
  };

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
      <button type="button" onClick={() => memoryHistory.push("/before")}>
        before
      </button>
      <button
        type="button"
        onClick={() => memoryHistory.push("/players_choose")}
      >
        players_choose
      </button>
      <button type="button" onClick={() => memoryHistory.push("/host_chooses")}>
        host_chooses
      </button>
      <button type="button" onClick={() => memoryHistory.push("/after")}>
        after
      </button>
      <button type="button" onClick={() => memoryHistory.push("/scoreboard")}>
        scoreboard
      </button>
      <button type="button" onClick={() => browserHistory.push("/")}>
        home
      </button>

      <button type="button" onClick={handleCreateGame}>
        /game/create success
      </button>

      <button type="button" onClick={() => handleValidateGame(gameCodeNew)}>
        /game/validate success
      </button>

      <button type="button" onClick={() => handleValidateGame("123")}>
        /game/validate not found
      </button>

      <button
        type="button"
        onClick={() => handleCreatePlayer(gameCodeNew, "test")}
      >
        /player/create success (twice for nickname taken)
      </button>

      <button type="button" onClick={() => handleCreatePlayer("123", "test2")}>
        /player/create code not found
      </button>

      <p>Api Response: {apiResponse}</p>
    </>
  );
};

export default BasicPage;
