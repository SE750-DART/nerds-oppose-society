import React from "react";
import renderer from "react-test-renderer";
import TextField from "../TextField";

it("Text field snapshot testing", () => {
  const treeBig = renderer
    .create(
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      <TextField textValue="" label="Game code" onChangeHandler={() => {}} />
    )
    .toJSON();
  expect(treeBig).toMatchSnapshot();

  const treeSmall = renderer
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    .create(<TextField textValue="" onChangeHandler={() => {}} size="small" />)
    .toJSON();
  expect(treeSmall).toMatchSnapshot();
});
