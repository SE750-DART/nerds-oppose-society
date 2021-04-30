import React from "react";
import {
  MemoryRouter,
  Switch,
  Route,
  Redirect,
  useParams,
} from "react-router-dom";
import BasicPage from "./BasicPage";

type PathParams = {
  gameCode: string;
};

const GameRouter = ({ browserHistory }: { browserHistory: any }) => {
  const { gameCode } = useParams<PathParams>();

  return (
    <MemoryRouter>
      <Switch>
        <Route path="/nickname">
          <BasicPage
            gameCode={gameCode}
            browserHistory={browserHistory}
            path="nickname"
          />
        </Route>

        <Route path="/lobby">
          <BasicPage
            gameCode={gameCode}
            browserHistory={browserHistory}
            path="lobby"
          />
        </Route>

        <Route path="/preRound">
          <BasicPage
            gameCode={gameCode}
            browserHistory={browserHistory}
            path="preRound"
          />
        </Route>

        <Route path="/submitPunchline">
          <BasicPage
            gameCode={gameCode}
            browserHistory={browserHistory}
            path="submitPunchline"
          />
        </Route>

        <Route path="/selectPunchline">
          <BasicPage
            gameCode={gameCode}
            browserHistory={browserHistory}
            path="selectPunchline"
          />
        </Route>

        <Route path="/postRound">
          <BasicPage
            gameCode={gameCode}
            browserHistory={browserHistory}
            path="postRound"
          />
        </Route>

        <Route path="/scoreboard">
          <BasicPage
            gameCode={gameCode}
            browserHistory={browserHistory}
            path="scoreboard"
          />
        </Route>

        <Route path="*">
          <Redirect to="/nickname" />
        </Route>
      </Switch>
    </MemoryRouter>
  );
};

export default GameRouter;
