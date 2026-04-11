import { Authentication, type AuthenticationCookieStore } from "@selfmail/authentication";
import { db, type User } from "@selfmail/db";
import { createLogger } from "@selfmail/logging";
import {
  deleteCookie,
  getCookie,
  getRequestHost,
  getRequestProtocol,
  setCookie,
} from "@tanstack/react-start/server";

const logger = createLogger("auth-session");

const sessionRepository = {
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
};

export const authSession = new Authentication<User>({
  logger,
  sessions: sessionRepository,
});

export const getAuthenticationCookies = (): AuthenticationCookieStore => ({
  delete: (name, options) => {
    deleteCookie(name, options);
  },
  get: (name) => getCookie(name),
  set: (name, value, options) => {
    setCookie(name, value, options);
  },
});

export const getAuthenticationRequest = () => ({
  appUrl: process.env.SELFMAIL_APP_URL?.trim(),
  host: getRequestHost({ xForwardedHost: true }),
  protocol: getRequestProtocol({ xForwardedProto: true }),
});
