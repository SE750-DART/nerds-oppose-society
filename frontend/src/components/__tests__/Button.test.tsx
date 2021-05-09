import React from "react";
import renderer from "react-test-renderer";
import Button from "../Button";

it("Button snapshot testing", () => {
  const treePrimary = renderer
    .create(<Button text="Start game" handleOnClick={() => {}} />)
    .toJSON();
  expect(treePrimary).toMatchSnapshot();

  const treeSecondary = renderer
    .create(
      <Button text="Start game" handleOnClick={() => {}} variant="secondary" />
    )
    .toJSON();
  expect(treeSecondary).toMatchSnapshot();
});
