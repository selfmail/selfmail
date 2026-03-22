import { createServerFn } from "@tanstack/react-start";
import {
  ArcticFetchError,
  Google,
  generateCodeVerifier,
  generateState,
  OAuth2RequestError,
} from "arctic";

const google = new Google(clientId, clientSecret, redirectURI);

export const handleLoginForm = createServerFn({
  method: "POST",
}).handler(async (ctx) => {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const scopes = ["openid", "profile"];
  const url = google.createAuthorizationURL(state, codeVerifier, scopes);
  try {
    const tokens = await google.refreshAccessToken(refreshToken);
    const accessToken = tokens.accessToken();
    const accessTokenExpiresAt = tokens.accessTokenExpiresAt();
  } catch (e) {
    if (e instanceof OAuth2RequestError) {
      // Invalid authorization code, credentials, or redirect URI
    }
    if (e instanceof ArcticFetchError) {
      // Failed to call `fetch()`
    }
    // Parse error
  }

  console.log("Handling login form with data:", ctx.data);

  console.log("Login successful, redirecting...");

  return "Form submitted successfully";
});
