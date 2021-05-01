import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders test element in App", () => {
  render(<App />);
  const testElement = screen.getByTestId("test");
  expect(testElement).toBeInTheDocument();
});
