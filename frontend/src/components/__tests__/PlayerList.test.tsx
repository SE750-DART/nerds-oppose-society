import React from "react";
import renderer from "react-test-renderer";
import PlayerList from "../PlayerList";
import { PlayersProvider } from "../../contexts/players";

it("PlayerList snapshot testing", () => {
  const treeLobby = renderer
    .create(
      <PlayersProvider>
        <PlayerList gameState="lobby" />
      </PlayersProvider>
    )
    .toJSON();
  expect(treeLobby).toMatchSnapshot();

  const treeMidgame = renderer
    .create(
      <PlayersProvider>
        <PlayerList gameState="midround" />
      </PlayersProvider>
    )
    .toJSON();
  expect(treeMidgame).toMatchSnapshot();
});
