import React, { useCallback, useEffect } from "react";
import { PlayersActions, usePlayers } from "../contexts/players";
import { PunchlinesAction, usePunchlines } from "../contexts/punchlines";
import { RoundAction, useRound } from "../contexts/round";
import { Settings } from "../GameRouter";
import createPersistedState from "use-persisted-state";
import { Socket } from "socket.io-client";
import { MemoryHistory } from "history";
import { Setup } from "../types";
import { Player } from "../types";

const usePlayerIdState = createPersistedState("playerId");
const useTokenState = createPersistedState("token");

export const useSetupSocketHandlers = (
  socket: Socket,
  memoryHistory: MemoryHistory,
  settings: Settings,
  setSettings: React.Dispatch<React.SetStateAction<Settings>>
) => {
  const [, setPlayerId] = usePlayerIdState("");
  const [, setToken] = useTokenState("");
  const [, dispatchPlayers] = usePlayers();
  const [, dispatchPunchlines] = usePunchlines();
  const [, dispatchRound] = useRound();

  // Connection
  const handleNavigate = useCallback(
    (path: string) => memoryHistory.push(path.toLowerCase()),
    [memoryHistory]
  );
  const handleHost = useCallback(
    (id: string) =>
      dispatchPlayers({
        type: PlayersActions.SET_HOST,
        id,
      }),
    [dispatchPlayers]
  );
  const handlePlayersInitial = useCallback(
    (players: Player[]) =>
      dispatchPlayers({
        type: PlayersActions.INITIALISE,
        players,
      }),
    [dispatchPlayers]
  );
  const handleSettingsInitial = useCallback(setSettings, [setSettings]);
  const handleConnectError = useCallback(() => {
    setPlayerId("");
    setToken("");
  }, [setPlayerId, setToken]);

  // Lobby
  const handlePlayersAdd = useCallback(
    (id: string, nickname: string) =>
      dispatchPlayers({
        type: PlayersActions.ADD,
        id,
        nickname,
      }),
    [dispatchPlayers]
  );
  const handlePlayersRemove = useCallback(
    (id: string) =>
      dispatchPlayers({
        type: PlayersActions.REMOVE,
        id,
      }),
    [dispatchPlayers]
  );
  const handleSettingsUpdate = useCallback(
    (setting, value) => {
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
    [setSettings, settings]
  );

  // Round
  const handlePunchlinesAdd = useCallback(
    (punchlines: string[]) =>
      dispatchPunchlines({ type: PunchlinesAction.ADD, punchlines }),
    [dispatchPunchlines]
  );
  const handlePunchlinesRemove = useCallback(
    (punchlines: string[]) =>
      dispatchPunchlines({
        type: PunchlinesAction.REMOVE,
        punchlines,
      }),
    [dispatchPunchlines]
  );
  const handleRoundNumber = useCallback(
    (roundNumber: number) =>
      dispatchRound({
        type: RoundAction.NEW_ROUND,
        roundNumber,
      }),
    [dispatchRound]
  );
  const handleRoundSetup = useCallback(
    (setup: Setup) =>
      dispatchRound({
        type: RoundAction.SET_SETUP,
        setup,
      }),
    [dispatchRound]
  );
  const handleRoundIncrementPlayersChosen = useCallback(
    () => dispatchRound({ type: RoundAction.INCREMENT_PLAYERS_CHOSEN }),
    [dispatchRound]
  );
  const handleRoundChosenPunchlines = useCallback(
    (punchlines: string[][]) =>
      dispatchRound({
        type: RoundAction.SET_CHOSEN_PUNCHLINES,
        punchlines,
      }),
    [dispatchRound]
  );
  const handleRoundWinner = useCallback(
    (winningPlayerId: string, winningPunchlines: string[]) => {
      dispatchRound({
        type: RoundAction.SET_WINNER,
        winningPlayerId,
        winningPunchlines,
      });
      dispatchPlayers({
        type: PlayersActions.INCREMENT_SCORE,
        id: winningPlayerId,
      });
    },
    [dispatchPlayers, dispatchRound]
  );

  useEffect(() => {
    // Connection
    socket.on("navigate", handleNavigate);
    socket.on("host", handleHost);
    socket.on("players:initial", handlePlayersInitial);
    socket.on("settings:initial", handleSettingsInitial);
    socket.on("connect_error", handleConnectError);

    // Lobby
    socket.on("players:add", handlePlayersAdd);
    socket.on("players:remove", handlePlayersRemove);
    socket.on("settings:update", handleSettingsUpdate);

    // Round
    socket.on("punchlines:add", handlePunchlinesAdd);
    socket.on("punchlines:remove", handlePunchlinesRemove);
    socket.on("round:number", handleRoundNumber);
    socket.on("round:setup", handleRoundSetup);
    socket.on(
      "round:increment-players-chosen",
      handleRoundIncrementPlayersChosen
    );
    socket.on("round:chosen-punchlines", handleRoundChosenPunchlines);
    socket.on("round:winner", handleRoundWinner);
    return () => {
      // Remove event handlers when component is unmounted to prevent buildup of identical handlers
      // Connection
      socket.off("navigate", handleNavigate);
      socket.off("host", handleHost);
      socket.off("players:initial", handlePlayersInitial);
      socket.off("settings:initial", handleSettingsInitial);
      socket.off("connect_error", handleConnectError);

      // Lobby
      socket.off("players:add", handlePlayersAdd);
      socket.off("players:remove", handlePlayersRemove);
      socket.off("settings:update", handleSettingsUpdate);

      // Round
      socket.off("punchlines:add", handlePunchlinesAdd);
      socket.off("round:number", handleRoundNumber);
      socket.off("round:setup", handleRoundSetup);
      socket.off(
        "round:increment-players-chosen",
        handleRoundIncrementPlayersChosen
      );
      socket.off("round:chosen-punchlines", handleRoundChosenPunchlines);
      socket.off("round:winner", handleRoundWinner);
    };
  });
};
