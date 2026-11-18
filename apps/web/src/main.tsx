import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { Providers } from "@/components/providers";
import { AppRouter } from "@/router";

import "./index.css";

const root = document.getElementById("root");
if (!root) throw new Error("#root is missing from index.html");

createRoot(root).render(
  <StrictMode>
    <Providers>
      <AppRouter />
    </Providers>
  </StrictMode>,
);
