import handler from "@tanstack/react-start/server-entry";
import { paraglideMiddleware } from "./paraglide/server.js";

const ALLOWED_ORIGINS = new Set([
  "https://selfmail.app",
  "http://localhost:3010",
  "http://auth.selfmail.local:3010",
  "http://selfmail.local",
]);

const isOriginAllowed = (req: Request): boolean => {
  const method = req.method.toUpperCase();

  // Only check state-changing methods
  if (
    method !== "POST" &&
    method !== "PUT" &&
    method !== "DELETE" &&
    method !== "PATCH"
  ) {
    return true;
  }

  const origin = req.headers.get("Origin");

  // Browsers always send Origin on cross-origin POST requests.
  // Same-origin requests from the app itself will have a matching Origin.
  // Missing Origin on a POST likely means a non-browser client (curl, etc.)
  // which we reject for state-changing operations.
  if (!origin) {
    return false;
  }

  // Check exact match first
  if (ALLOWED_ORIGINS.has(origin)) {
    return true;
  }

  // Allow any subdomain of selfmail.app and selfmail.localhost
  try {
    const url = new URL(origin);
    const hostname = url.hostname;
    return (
      hostname === "selfmail.app" ||
      hostname.endsWith(".selfmail.app") ||
      hostname === "selfmail.localhost" ||
      hostname.endsWith(".selfmail.localhost")
    );
  } catch {
    return false;
  }
};

export default {
  fetch(req: Request): Promise<Response> {
    if (!isOriginAllowed(req)) {
      return Promise.resolve(
        new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        })
      );
    }

    return paraglideMiddleware(req, () => handler.fetch(req));
  },
};
