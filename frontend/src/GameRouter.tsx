import React, { useContext, useEffect, useState } from "react";
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

  const handleUpdateSettings = ({
    setting,
    value,
  }: {
    setting: string;
    value: number;
  }) => {
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
  };

  const clearPlayerCredentials = () => {
    setPlayerId("");
    setToken("");
  };

  useEffect(() => {
    socket.on("navigate", memoryHistory.push);
    socket.on("host", setHost);
    socket.on("players:initial", initialisePlayers);
    socket.on("players:add", addPlayer);
    socket.on("players:remove", removePlayer);
    socket.on("settings:initial", setSettings);
    socket.on("settings:update", handleUpdateSettings);
    socket.on("connect_error", clearPlayerCredentials);

    return () => {
      // Remove event handlers when component is unmounted to prevent buildup of identical handlers
      socket.off("navigate", memoryHistory.push);
      socket.off("host", setHost);
      socket.off("players:initial", initialisePlayers);
      socket.off("players:add", addPlayer);
      socket.off("players:remove", removePlayer);
      socket.off("settings:initial", setSettings);
      socket.off("settings:update", handleUpdateSettings);
      socket.off("connect_error", clearPlayerCredentials);
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
