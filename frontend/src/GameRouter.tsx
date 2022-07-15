import React, { useState } from "react";
import { Redirect, Route, Router, Switch, useParams } from "react-router-dom";
import { createMemoryHistory } from "history";
import {
  EndGamePage,
  EndRoundPage,
  LobbyPage,
  NicknamePage,
  SelectPunchlinePage,
  StartRoundPage,
  SubmitPunchlinePage,
} from "./pages";
import { SocketProvider } from "./contexts/socket";
import io from "socket.io-client";
import { useSetupSocketHandlers } from "./hooks/socket";

const socket = io({
  autoConnect: false,
});

export type Settings = {
  roundLimit: number;
  maxPlayers: number;
};

type PathParams = {
  gameCode: string;
};

const memoryHistory = createMemoryHistory();

const INITIAL_ROUND_LIMIT = 69;
const INITIAL_MAX_PLAYERS = 40;

const GameRouter = () => {
  const { gameCode } = useParams<PathParams>();
  const [settings, setSettings] = useState<Settings>({
    roundLimit: INITIAL_ROUND_LIMIT,
    maxPlayers: INITIAL_MAX_PLAYERS,
  });

  useSetupSocketHandlers(socket, memoryHistory, settings, setSettings);

  return (
    <SocketProvider socket={socket}>
      <Router history={memoryHistory}>
        <Switch>
          <Route path="/nickname">
            <NicknamePage gameCode={gameCode} />
          </Route>

          <Route path="/lobby">
            <LobbyPage gameCode={gameCode} settings={settings} />
          </Route>

          <Route path="/before">
            <StartRoundPage roundLimit={settings.roundLimit} />
          </Route>

          <Route path="/players_choose">
            <SubmitPunchlinePage roundLimit={settings.roundLimit} />
          </Route>

          <Route path="/host_chooses">
            <SelectPunchlinePage roundLimit={settings.roundLimit} />
          </Route>

          <Route path="/after">
            <EndRoundPage roundLimit={settings.roundLimit} />
          </Route>

          <Route path="/scoreboard">
            <EndGamePage />
          </Route>

          <Route path="*">
            <Redirect to="/nickname" />
          </Route>
        </Switch>
      </Router>
    </SocketProvider>
  );
};

export default GameRouter;
