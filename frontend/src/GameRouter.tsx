import React, { useCallback, useContext, useEffect, useState } from "react";
import { Router, Switch, Route, Redirect, useParams } from "react-router-dom";
import { createMemoryHistory } from "history";
import createPersistedState from "use-persisted-state";
import { BasicPage, NicknamePage, LobbyPage } from "./pages";
import socket from "./socket";
import { PlayersContext } from "./ContextProviders/PlayersContextProvider";

export type Settings = {
  roundLimit?: number;
  maxPlayers?: number;
};

type PathParams = {
  gameCode: string;
};

const memoryHistory = createMemoryHistory();
const usePlayerIdState = createPersistedState("playerId");
const useTokenState = createPersistedState("token");

const GameRouter = () => {
  const { gameCode } = useParams<PathParams>();
  const [, setPlayerId] = usePlayerIdState("");
  const [, setToken] = useTokenState("");
  const { setHost, initialisePlayers, addPlayer, removePlayer } = useContext(
    PlayersContext
  );
  const [settings, setSettings] = useState<Settings>();

  const handleNavigate = useCallback(memoryHistory.push, []);
  const handleHost = useCallback(setHost, []);
  const handlePlayersInitial = useCallback(initialisePlayers, []);
  const handlePlayersAdd = useCallback(addPlayer, []);
  const handlePlayersRemove = useCallback(removePlayer, []);
  const handleSettingsInitial = useCallback(setSettings, []);
  const handleSettingsUpdate = useCallback(
    ({ setting, value }: { setting: string; value: number }) => {
      let key;
      switch (setting) {
        case "MAX_PLAYERS":
          key = "maxPlayers";
          break;
        case "ROUND_LIMIT":
          key = "roundLimit";
          break;
        default:
          key = null;
      }
      if (key !== null) {
        const newSettings = {
          ...settings,
          [key]: value,
        };
        setSettings(newSettings);
      }
    },
    []
  );
  const handleConnectError = useCallback(() => {
    setPlayerId("");
    setToken("");
  }, []);

  useEffect(() => {
    socket.on("navigate", handleNavigate);
    socket.on("host", handleHost);
    socket.on("players:initial", handlePlayersInitial);
    socket.on("players:add", handlePlayersAdd);
    socket.on("players:remove", handlePlayersRemove);
    socket.on("settings:initial", handleSettingsInitial);
    socket.on("settings:update", handleSettingsUpdate);
    socket.on("connect_error", handleConnectError);

    return () => {
      // Remove event handlers when component is unmounted to prevent buildup of identical handlers
      socket.off("navigate", handleNavigate);
      socket.off("host", handleHost);
      socket.off("players:initial", handlePlayersInitial);
      socket.off("players:add", handlePlayersAdd);
      socket.off("players:remove", handlePlayersRemove);
      socket.off("settings:initial", handleSettingsInitial);
      socket.off("settings:update", handleSettingsUpdate);
      socket.off("connect_error", handleConnectError);
    };
  });

  return (
    <Router history={memoryHistory}>
      <Switch>
        <Route path="/nickname">
          <NicknamePage gameCode={gameCode} />
        </Route>

        <Route path="/lobby">
          <LobbyPage gameCode={gameCode} settings={settings} />
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
    </Router>
  );
};

export default GameRouter;
