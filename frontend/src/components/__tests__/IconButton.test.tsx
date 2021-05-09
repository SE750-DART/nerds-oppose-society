import React from "react";
import renderer from "react-test-renderer";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import IconButton from "../IconButton";

it("IconButton snapshot testing", () => {
  const treeNormal = renderer
    .create(<IconButton icon={faAngleDown} handleOnClick={() => {}} />)
    .toJSON();
  expect(treeNormal).toMatchSnapshot();

  const treeRotated = renderer
    .create(<IconButton icon={faAngleDown} handleOnClick={() => {}} rotated />)
    .toJSON();
  expect(treeRotated).toMatchSnapshot();
});
