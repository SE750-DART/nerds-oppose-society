import React from "react";
import renderer from "react-test-renderer";
import InputField from "../InputField";

it("Text field snapshot testing", () => {
  const treeBig = renderer
    .create(
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      <InputField textValue="" label="Game code" onChange={() => {}} />
    )
    .toJSON();
  expect(treeBig).toMatchSnapshot();

  const treeSmall = renderer
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    .create(<InputField textValue="" onChange={() => {}} size="small" />)
    .toJSON();
  expect(treeSmall).toMatchSnapshot();
});
