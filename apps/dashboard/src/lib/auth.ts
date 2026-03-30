import { SessionUtils } from "@selfmail/auth";
import { db } from "@selfmail/db";
import { createLogger } from "@selfmail/logging";
import { createServerFn } from "@tanstack/react-start";
import { getCookie, getRequestHost } from "@tanstack/react-start/server";

const logger = createLogger("dashboard-auth-middleware");
const PROD_AUTH_HREF = "https://auth.selfmail.app/login";
const DEV_AUTH_HREF = "http://auth.selfmail.localhost:1355/login";
const SESSION_COOKIE_NAME = SessionUtils.SESSION_COOKIE_NAME;

export const getCurrentUserFn = createServerFn({
  method: "GET",
}).handler(async () => {
  const host = getRequestHost({ xForwardedHost: true });
  const cookieDomain = SessionUtils.getCookieDomain(host);
  const rawToken = getCookie(SESSION_COOKIE_NAME);

  logger.info("Resolving auth session", {
    cookieDomain,
    hasSessionCookie: Boolean(rawToken),
    host,
  });

  if (!rawToken) {
    return null;
  }

  const sessionTokenHash = await SessionUtils.hashToken(rawToken);

  const session = await db.session.findUnique({
    include: {
      user: true,
    },
    where: {
      sessionToken: sessionTokenHash,
    },
  });

  if (!session) {
    logger.warn("Auth session cookie did not match a stored session", {
      cookieDomain,
      host,
      sessionTokenHashPrefix: sessionTokenHash.slice(0, 12),
    });
    SessionUtils.clearSessionCookie();
    return null;
  }

  if (session.expires < new Date()) {
    logger.info("Auth session expired", {
      cookieDomain,
      host,
      sessionTokenHashPrefix: sessionTokenHash.slice(0, 12),
      userId: session.user.id,
    });
    await db.session.deleteMany({
      where: {
        sessionToken: sessionTokenHash,
      },
    });
    SessionUtils.clearSessionCookie();

    return null;
  }

  logger.info("Resolved auth session", {
    cookieDomain,
    host,
    userId: session.user.id,
  });

  return session.user;
});

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
