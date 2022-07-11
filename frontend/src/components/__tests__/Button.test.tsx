import React from "react";
import renderer from "react-test-renderer";
import Button from "../Button";

it("Button snapshot testing", () => {
  const treePrimary = renderer
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    .create(<Button text="Start game" onClick={() => {}} />)
    .toJSON();
  expect(treePrimary).toMatchSnapshot();

  const treeSecondary = renderer
    .create(
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      <Button text="Start game" onClick={() => {}} variant="secondary" />
    )
    .toJSON();
  expect(treeSecondary).toMatchSnapshot();
});
