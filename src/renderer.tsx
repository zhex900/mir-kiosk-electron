import * as React from "react";
import * as ReactDOM from "react-dom";
import { hot } from "react-hot-loader";

import { App } from "./App";
import "./index.css";

ReactDOM.render(<App />, document.body);

export default hot(module)(App);
