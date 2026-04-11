import { Authentication, type AuthenticationCookieStore } from "@selfmail/authentication";
import { db, type User } from "@selfmail/db";
import { createLogger } from "@selfmail/logging";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import {
  deleteCookie,
  getCookie,
  getRequestHost,
  getRequestProtocol,
  setCookie,
} from "@tanstack/react-start/server";

const logger = createLogger("dashboard-auth-middleware");
const PROD_AUTH_HREF = "https://auth.selfmail.app/login";
const DEV_AUTH_HREF = "http://auth.selfmail.localhost:1355/login";

const authentication = new Authentication<User>({
  logger,
  sessions: {
    createSession: async ({
      expires,
      sessionTokenHash,
      userId,
    }: {
      expires: Date;
      sessionTokenHash: string;
      userId: string;
    }) => {
      await db.session.create({
        data: {
          expires,
          sessionToken: sessionTokenHash,
          userId,
        },
      });
    },
    deleteSession: async (sessionTokenHash: string) => {
      await db.session.deleteMany({
        where: {
          sessionToken: sessionTokenHash,
        },
      });
    },
    findSession: (sessionTokenHash: string) =>
      db.session.findUnique({
        include: {
          user: true,
        },
        where: {
          sessionToken: sessionTokenHash,
        },
      }),
  },
});

const getAuthenticationCookies = (): AuthenticationCookieStore => ({
  delete: (name, options) => {
    deleteCookie(name, options);
  },
  get: (name) => getCookie(name),
  set: (name, value, options) => {
    setCookie(name, value, options);
  },
});

const getAuthenticationRequest = () => ({
  host: getRequestHost({ xForwardedHost: true }),
  protocol: getRequestProtocol({ xForwardedProto: true }),
});

export const getCurrentUserFn = createServerFn({
  method: "GET",
}).handler(async () => {
  const user = await authentication.getCurrentUser({
    cookies: getAuthenticationCookies(),
    request: getAuthenticationRequest(),
  });

  if (!user) {
    throw redirect({
      href: getLoginHref(),
    });
  }

  return user;
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
