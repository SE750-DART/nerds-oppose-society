import React, { useContext, useState } from "react";
import { Router, Switch, Route, Redirect, useParams } from "react-router-dom";
import { createMemoryHistory } from "history";
import { BasicPage, NicknamePage, LobbyPage } from "./pages";
import socket from "./socket";
import {
  Player,
  PlayersContext,
} from "./ContextProviders/PlayersContextProvider";
import { Settings } from "../../backend/src/models";

type PathParams = {
  gameCode: string;
};

const memoryHistory = createMemoryHistory();

const GameRouter = () => {
  const { gameCode } = useParams<PathParams>();
  const { setHost, initialisePlayers, addPlayer, removePlayer } = useContext(
    PlayersContext
  );
  const [settings, setSettings] = useState<Settings>();

  socket.on("navigate", (route: string) => memoryHistory.push(route));
  socket.on("host", (host: string) => setHost(host));
  socket.on("players:initial", (players: Player[]) =>
    initialisePlayers(players)
  );
  socket.on("players:add", (nickname: string) => addPlayer(nickname));
  socket.on("players:remove", (nickname: string) => removePlayer(nickname));
  socket.on("settings:initial", (initialSettings: Settings) =>
    setSettings(initialSettings)
  );
  socket.on("settings:update", (newSettings: Settings) =>
    setSettings(newSettings)
  );

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
