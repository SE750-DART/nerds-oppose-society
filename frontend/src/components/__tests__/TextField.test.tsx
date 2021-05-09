import React from "react";
import renderer from "react-test-renderer";
import TextField from "../TextField";

it("Text field snapshot testing", () => {
  const treeBig = renderer
    .create(
      <TextField textValue="" label="Game code" onChangeHandler={() => {}} />
    )
    .toJSON();
  expect(treeBig).toMatchSnapshot();

  const treeSmall = renderer
    .create(<TextField textValue="" onChangeHandler={() => {}} size="small" />)
    .toJSON();
  expect(treeSmall).toMatchSnapshot();
});
