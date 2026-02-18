import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { getStoredToken } from "./utils/authStorage";

const originalFetch = window.fetch;
const rewriteApiUrl = (rawUrl) => {
  if (!rawUrl) return rawUrl;

  // If some parts of the app still call the backend with an absolute
  // `http://localhost:5000/...` URL, this breaks when the frontend is accessed
  // via ngrok / another host. Rewrite those calls to same-origin so Vite can
  // proxy `/api/*` to the local backend.
  try {
    const url = new URL(rawUrl, window.location.origin);
    const isLocalBackendHost =
      url.hostname === "localhost" || url.hostname === "127.0.0.1";
    const isBackendPort = url.port === "5000";

    if (isLocalBackendHost && isBackendPort) {
      return `${window.location.origin}${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    // ignore URL parse errors and keep original
  }

  return rawUrl;
};

window.fetch = (input, init = {}) => {
  const rawUrl = typeof input === "string" ? input : input?.url || "";
  const url = rewriteApiUrl(rawUrl);
  const isApiRequest = url.includes("/api/");
  const isAuthRequest = url.includes("/api/users/auth");
  const token = getStoredToken();

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
