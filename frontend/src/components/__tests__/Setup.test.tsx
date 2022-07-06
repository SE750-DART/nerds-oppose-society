import React from "react";
import renderer from "react-test-renderer";
import Setup from "../Setup";

it("Setup snapshot testing", () => {
  const shortSetup = "Daddy, why is mommy crying?";
  const longSetup =
    "After four platinum albums and three Grammys, it's time to get back to my roots, to what inspired me to make music in the first place: __________.";

  const treeShort = renderer.create(<Setup setupText={shortSetup} />).toJSON();
  expect(treeShort).toMatchSnapshot();

  const treeLong = renderer.create(<Setup setupText={longSetup} />).toJSON();
  expect(treeLong).toMatchSnapshot();
});
