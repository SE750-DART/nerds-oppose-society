import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

test("renders test element in App", () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const testElement = screen.getByTestId("test");
  expect(testElement).toBeInTheDocument();
});
