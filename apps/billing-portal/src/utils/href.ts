const PROD_AUTH_HREF = "https://auth.selfmail.app/login";
const DEV_AUTH_HREF = "http://auth.selfmail.localhost:1355/login";

export const getLoginHref = () => {
  if (typeof window === "undefined") {
    return process.env.SELFMAIL_AUTH_URL
      ? new URL("/login", process.env.SELFMAIL_AUTH_URL).toString()
      : DEV_AUTH_HREF;
  }

  return window.location.hostname.endsWith(".selfmail.app") ||
    window.location.hostname === "selfmail.app"
    ? PROD_AUTH_HREF
    : DEV_AUTH_HREF;
};
