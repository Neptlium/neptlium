import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const root = document.getElementById("root");

if (!root) {
  document.body.innerHTML = `
    <div style="color:white;background:#05070A;padding:20px;">
      Netlium failed to mount: Root element missing
    </div>
  `;
  throw new Error("Root element not found");
}

createRoot(root).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
