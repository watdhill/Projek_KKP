import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

const originalFetch = window.fetch;
const rewriteApiUrl = (rawUrl) => {
  if (!rawUrl) return rawUrl;
  if (rawUrl.startsWith("http://localhost:5000")) {
    return rawUrl.replace(
      "http://localhost:5000",
      `http://${window.location.hostname}:5000`,
    );
  }
  return rawUrl;
};

window.fetch = (input, init = {}) => {
  const rawUrl = typeof input === "string" ? input : input?.url || "";
  const url = rewriteApiUrl(rawUrl);
  const isApiRequest = url.includes("/api/");
  const isAuthRequest = url.includes("/api/users/auth");
  const token = localStorage.getItem("token");

  const baseRequest = input instanceof Request ? new Request(url, input) : null;

  if (!isApiRequest || isAuthRequest || !token) {
    if (baseRequest) {
      return originalFetch(baseRequest, init);
    }
    return originalFetch(url, init);
  }

  const headers = new Headers(
    init.headers || (baseRequest ? baseRequest.headers : undefined),
  );

  if (!headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const nextInit = { ...init, headers };
  if (baseRequest) {
    return originalFetch(new Request(baseRequest, nextInit));
  }

  return originalFetch(url, nextInit);
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
