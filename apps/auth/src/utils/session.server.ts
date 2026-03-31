import { db } from "@selfmail/db";
import { createLogger } from "@selfmail/logging";
import {
  deleteCookie,
  getCookie,
  getRequestHost,
  getRequestProtocol,
  setCookie,
} from "@tanstack/react-start/server";

const PROD_SHARED_DOMAIN = "selfmail.app";
const DEV_SHARED_DOMAIN = "dashboard.selfmail.localhost:1355";
const DEV_LOCALHOST_DOMAIN = "dashboard.selfmail.localhost:1355";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;
const TEMP_SESSION_DURATION_SECONDS = 60 * 15;
const logger = createLogger("auth-session");

export abstract class SessionUtils {
  static readonly SESSION_COOKIE_NAME = "selfmail-session-token";
  static readonly TEMP_SESSION_COOKIE_NAME = "selfmail-temp-session-token";

  private static normalizeHost(host: string) {
    return host.split(":")[0].trim().toLowerCase();
  }

  static getCookieDomain(host: string) {
    const hostname = SessionUtils.normalizeHost(host);

    if (
      hostname === PROD_SHARED_DOMAIN ||
      hostname.endsWith(`.${PROD_SHARED_DOMAIN}`)
    ) {
      return `.${PROD_SHARED_DOMAIN}`;
    }

    if (
      hostname === DEV_SHARED_DOMAIN ||
      hostname.endsWith(`.${DEV_SHARED_DOMAIN}`)
    ) {
      return `.${DEV_SHARED_DOMAIN}`;
    }

    if (
      hostname === DEV_LOCALHOST_DOMAIN ||
      hostname.endsWith(`.${DEV_LOCALHOST_DOMAIN}`)
    ) {
      return `.${DEV_LOCALHOST_DOMAIN}`;
    }

    return undefined;
  }

  private static getCookieConfig(maxAge: number) {
    const host = getRequestHost({ xForwardedHost: true });
    const hostname = SessionUtils.normalizeHost(host);
    const protocol = getRequestProtocol({ xForwardedProto: true });

    return {
      domain: SessionUtils.getCookieDomain(host),
      httpOnly: true,
      maxAge,
      path: "/",
      sameSite: "lax" as const,
      secure:
        protocol === "https" ||
        hostname === PROD_SHARED_DOMAIN ||
        hostname.endsWith(`.${PROD_SHARED_DOMAIN}`),
    };
  }

  private static createToken() {
    return crypto.randomUUID().replaceAll("-", "");
  }

  static createBrowserToken() {
    return SessionUtils.createToken();
  }

  static async hashToken(value: string) {
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(value)
    );

    return Array.from(new Uint8Array(digest), (part) =>
      part.toString(16).padStart(2, "0")
    ).join("");
  }

  static async createSession(userId: string) {
    const rawToken = SessionUtils.createToken();
    const sessionTokenHash = await SessionUtils.hashToken(rawToken);
    const expires = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000);
    const host = getRequestHost({ xForwardedHost: true });
    const cookieDomain = SessionUtils.getCookieDomain(host);

    await db.session.create({
      data: {
        expires,
        sessionToken: sessionTokenHash,
        userId,
      },
    });

    setCookie(
      SessionUtils.SESSION_COOKIE_NAME,
      rawToken,
      SessionUtils.getCookieConfig(SESSION_DURATION_SECONDS)
    );
    logger.info("Created auth session", {
      cookieDomain,
      expiresAt: expires.toISOString(),
      host,
      userId,
    });

    return {
      expires,
      sessionToken: rawToken,
    };
  }

  static clearSessionCookie() {
    deleteCookie(
      SessionUtils.SESSION_COOKIE_NAME,
      SessionUtils.getCookieConfig(0)
    );
  }

  static setTempSessionCookie(token: string) {
    setCookie(
      SessionUtils.TEMP_SESSION_COOKIE_NAME,
      token,
      SessionUtils.getCookieConfig(TEMP_SESSION_DURATION_SECONDS)
    );
  }

  static getTempSessionCookie() {
    return getCookie(SessionUtils.TEMP_SESSION_COOKIE_NAME);
  }

  static clearTempSessionCookie() {
    deleteCookie(
      SessionUtils.TEMP_SESSION_COOKIE_NAME,
      SessionUtils.getCookieConfig(0)
    );
  }

  static getAppRedirectUrl() {
    const appUrl = process.env.SELFMAIL_APP_URL?.trim();

    if (appUrl) {
      return appUrl;
    }

    const host = SessionUtils.normalizeHost(
      getRequestHost({ xForwardedHost: true })
    );

    if (host === DEV_SHARED_DOMAIN || host.endsWith(`.${DEV_SHARED_DOMAIN}`)) {
      return `http://${DEV_SHARED_DOMAIN}`;
    }

    if (
      host === DEV_LOCALHOST_DOMAIN ||
      host.endsWith(`.${DEV_LOCALHOST_DOMAIN}`)
    ) {
      return `http://${DEV_LOCALHOST_DOMAIN}`;
    }

    return `https://${PROD_SHARED_DOMAIN}`;
  }

  static async getCurrentUser() {
    const host = getRequestHost({ xForwardedHost: true });
    const cookieDomain = SessionUtils.getCookieDomain(host);
    const rawToken = getCookie(SessionUtils.SESSION_COOKIE_NAME);

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
  }

  static async destroySession() {
    const rawToken = getCookie(SessionUtils.SESSION_COOKIE_NAME);

    if (rawToken) {
      const sessionTokenHash = await SessionUtils.hashToken(rawToken);
      await db.session.deleteMany({
        where: {
          sessionToken: sessionTokenHash,
        },
      });
    }

    SessionUtils.clearSessionCookie();
  }
}

export const SESSION_COOKIE_NAME = SessionUtils.SESSION_COOKIE_NAME;
export const TEMP_SESSION_COOKIE_NAME = SessionUtils.TEMP_SESSION_COOKIE_NAME;
