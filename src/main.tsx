import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "./lib/theme";
import App from "./App";
import "./design/globals.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
