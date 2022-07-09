import React from "react";
import renderer from "react-test-renderer";
import PlayerList from "../PlayerList";
import { PlayersContextProvider } from "../../contexts/players";

it("PlayerList snapshot testing", () => {
  const treeLobby = renderer
    .create(
      <PlayersContextProvider>
        <PlayerList gameState="lobby" />
      </PlayersContextProvider>
    )
    .toJSON();
  expect(treeLobby).toMatchSnapshot();

  const treeMidgame = renderer
    .create(
      <PlayersContextProvider>
        <PlayerList gameState="midround" />
      </PlayersContextProvider>
    )
    .toJSON();
  expect(treeMidgame).toMatchSnapshot();
});
