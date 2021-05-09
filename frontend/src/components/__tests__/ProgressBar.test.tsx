import React from "react";
import renderer from "react-test-renderer";
import ProgressBar from "../ProgressBar";

it("Progress bar snapshot testing", () => {
  const treeBar = renderer
    .create(<ProgressBar playersChosen={2} playersTotal={4} />)
    .toJSON();
  expect(treeBar).toMatchSnapshot();
});
