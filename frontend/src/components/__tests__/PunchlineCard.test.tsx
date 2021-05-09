import React from "react";
import renderer from "react-test-renderer";
import PunchlineCard from "../PunchlineCard";

it("Punchline card snapshot testing", () => {
  const shortPunchline: string = "Me time.";
  const longPunchline: string =
    "Looking in the mirror, applying lipstick, and whispering “tonight, you will have sex with Tom Cruise.”";

  const treeBasicPunchline = renderer
    .create(<PunchlineCard text={shortPunchline} />)
    .toJSON();
  expect(treeBasicPunchline).toMatchSnapshot();

  const treeLong = renderer
    .create(<PunchlineCard text={longPunchline} />)
    .toJSON();
  expect(treeLong).toMatchSnapshot();

  const treeNew = renderer
    .create(<PunchlineCard text={shortPunchline} newCard />)
    .toJSON();
  expect(treeNew).toMatchSnapshot();

  const treeNum = renderer
    .create(<PunchlineCard text={shortPunchline} selectedNum={2} />)
    .toJSON();
  expect(treeNum).toMatchSnapshot();
});
