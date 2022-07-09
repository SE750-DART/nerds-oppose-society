import React from "react";
import renderer from "react-test-renderer";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import IconButton from "../IconButton";

it("IconButton snapshot testing", () => {
  const treeNormal = renderer
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    .create(<IconButton icon={faAngleDown} handleOnClick={() => {}} />)
    .toJSON();
  expect(treeNormal).toMatchSnapshot();

  const treeRotated = renderer
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    .create(<IconButton icon={faAngleDown} handleOnClick={() => {}} rotated />)
    .toJSON();
  expect(treeRotated).toMatchSnapshot();
});
