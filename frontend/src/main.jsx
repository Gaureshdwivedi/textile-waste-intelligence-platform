import React from "react";
import ReactDOM from "react-dom/client";

import {
  BrowserRouter,
} from "react-router-dom";

import App from "./App";

import ThemeContextProvider
from "./theme/ColorModeContext";

ReactDOM.createRoot(
  document.getElementById("root")
).render(

  <React.StrictMode>

    <BrowserRouter>

      <ThemeContextProvider>

        <App />

      </ThemeContextProvider>

    </BrowserRouter>

  </React.StrictMode>

);