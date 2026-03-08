import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@selfmail/ui/styles.css";
import "./styles/index.css";
import Routes from "./routes.tsx";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <Routes />
  </StrictMode>
);
