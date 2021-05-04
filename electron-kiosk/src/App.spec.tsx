import React from "react";
import { render } from "@testing-library/react";
import { App } from "./App";

test("App should render", () => {
  const { getByText } = render(<App />);
  expect(getByText("Loading...")).toBeTruthy();
});
