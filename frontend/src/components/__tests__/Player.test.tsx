import React from "react";
import renderer from "react-test-renderer";
import Player from "../PlayerList/Player";

it("Player snapshot testing", () => {
  const treeBasicPlayer = renderer
    .create(<Player nickname="Di Kun Ong" divider={false} score={4} />)
    .toJSON();
  expect(treeBasicPlayer).toMatchSnapshot();

  const treeDivider = renderer
    .create(<Player nickname="Alex Verkerk" divider />)
    .toJSON();
  expect(treeDivider).toMatchSnapshot();

  const treeHost = renderer
    .create(<Player nickname="Rawiri Hohepa" divider={false} isHost />)
    .toJSON();
  expect(treeHost).toMatchSnapshot();

  const treeIsMe = renderer
    .create(
      <Player nickname="Tait Fuller" divider={false} highlight score={3} />
    )
    .toJSON();
  expect(treeIsMe).toMatchSnapshot();
});
