import React from "react";
import renderer from "react-test-renderer";
import Button from "../Button";

it("Button snapshot testing", () => {
  const treePrimary = renderer.create(<Button>Start game</Button>).toJSON();
  expect(treePrimary).toMatchSnapshot();

  const treeSecondary = renderer
    .create(<Button variant="secondary">Start game</Button>)
    .toJSON();
  expect(treeSecondary).toMatchSnapshot();
});
