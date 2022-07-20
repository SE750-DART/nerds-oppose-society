import React, { useContext, useEffect, useMemo, useState } from "react";
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
import { SocketType } from "./types/socket";
import createPersistedState from "use-persisted-state";
import { BrowserHistoryContext } from "./App";
import { useGet } from "./hooks/axios";

const socket: SocketType = io({
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

const usePlayerIdState = createPersistedState("playerId");
const useTokenState = createPersistedState("token");

const GameRouter = () => {
  const [playerId] = usePlayerIdState("");
  const [token] = useTokenState("");

  const { gameCode } = useParams<PathParams>();
  const [settings, setSettings] = useState<Settings>({
    roundLimit: INITIAL_ROUND_LIMIT,
    maxPlayers: INITIAL_MAX_PLAYERS,
  });
  const browserHistory = useContext(BrowserHistoryContext);

  const [, validateGameCode] = useGet(
    "/api/game/validate",
    /*
    As `validateGameCode` runs inside a `useEffect()` we need to create the
    config object with `useMemo()` to prevent unnecessary re-renders.
     */
    useMemo(
      () => ({
        params: { gameCode },
      }),
      [gameCode]
    )
  );

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      const response = await validateGameCode(controller);
      if (response === null) {
        browserHistory.push("/");
      }
    })();
    return () => controller.abort();
  }, [browserHistory, validateGameCode]);

  useSetupSocketHandlers(socket, memoryHistory, settings, setSettings);

  useEffect(() => {
    if (playerId && token) {
      socket.auth = { gameCode, playerId, token };
      /*
      If the connection fails here, `playerId` and `token` are cleared by the
      `connect_error` event handler initialised in `useSetupSocketHandlers()`.
       */
      socket.connect();
    }
    return () => {
      socket.close();
    };
  }, [gameCode, playerId, token]);

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
            <StartRoundPage roundLimit={settings.roundLimit ?? 0} />
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
