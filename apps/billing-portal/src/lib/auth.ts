import { Authentication, type AuthenticationCookieStore } from "@selfmail/authentication";
import { db, type User } from "@selfmail/db";
import { redirect } from "@tanstack/react-router";
import { createMiddleware, createServerFn } from "@tanstack/react-start";
import {
  deleteCookie,
  getCookie,
  getRequestHost,
  getRequestProtocol,
  setCookie,
} from "@tanstack/react-start/server";
import { hasPermissions, type PermissionName } from "@selfmail/permissions";
import { getLoginHref } from "#/utils/href";

const BILLING_ACCESS_ERROR = "You do not have access to this workspace";

const getBillingHomeHref = (error?: string) =>
  error ? `/?error=${encodeURIComponent(error)}` : "/";

const authentication = new Authentication<User>({
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

export const authenticatedMiddleware = createMiddleware().server(
  async ({ next }) => {
    const user = await authentication.getCurrentUser({
      cookies: getAuthenticationCookies(),
      request: getAuthenticationRequest(),
    });

    if (!user) {
      throw redirect({
        href: getLoginHref(),
      });
    }

    return next({
      context: {
        user,
      },
    });
  }
);

export const permissionMiddleware = (
  workspaceId: string,
  requiredPermissions: readonly PermissionName[]
) =>
  createMiddleware()
    .middleware([authenticatedMiddleware])
    .server(async ({ next, context }) => {
      const { id } = context.user;

      const member = await db.member.findUnique({
        where: {
          userWorkspaceId: {
            userId: id,
            workspaceId,
          },
        },
        select: {
          id: true,
        },
      });

      if (!member) {
        throw redirect({
          href: getBillingHomeHref(BILLING_ACCESS_ERROR),
        });
      }

      const allowed = await hasPermissions({
        memberId: member.id,
        permissions: requiredPermissions,
        workspaceId,
      });

      if (!allowed) {
        throw redirect({
          href: getBillingHomeHref(BILLING_ACCESS_ERROR),
        });
      }

      return next({
        context: {
          permissions: requiredPermissions,
        },
      });
    });
