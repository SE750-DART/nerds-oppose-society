import React from "react";
import {
  MemoryRouter,
  Switch,
  Route,
  Redirect,
  useParams,
} from "react-router-dom";
import BasicPage from "./pages/BasicPage";
import NicknamePage from "./pages/NicknamePage";
import LobbyPage from "./pages/LobbyPage";

type PathParams = {
  gameCode: string;
};

const GameRouter = () => {
  const { gameCode } = useParams<PathParams>();

  return (
    <MemoryRouter>
      <Switch>
        <Route path="/nickname">
          <NicknamePage />
        </Route>

        <Route path="/lobby">
          <LobbyPage gameCode={gameCode} />
        </Route>

        <Route path="/preRound">
          <BasicPage gameCode={gameCode} path="preRound" />
        </Route>

        <Route path="/submitPunchline">
          <BasicPage gameCode={gameCode} path="submitPunchline" />
        </Route>

        <Route path="/selectPunchline">
          <BasicPage gameCode={gameCode} path="selectPunchline" />
        </Route>

        <Route path="/postRound">
          <BasicPage gameCode={gameCode} path="postRound" />
        </Route>

        <Route path="/scoreboard">
          <BasicPage gameCode={gameCode} path="scoreboard" />
        </Route>

        <Route path="*">
          <Redirect to="/nickname" />
        </Route>
      </Switch>
    </MemoryRouter>
  );
};

export default GameRouter;
