import React from "react";
import renderer from "react-test-renderer";
import Dropdown from "../Dropdown";

it("Dropdown snapshot testing", () => {
  const aboveDropNodes: React.ReactNode = <h4>Scoreboard</h4>;

  const belowDropNodes: React.ReactNode = (
    <>
      <p>Test item 1</p>
      <p>Test item 2</p>
    </>
  );

  const component = renderer.create(
    <Dropdown
      aboveDrop={aboveDropNodes}
      belowDrop={belowDropNodes}
      header="Round 42 of 69"
    />
  );
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
