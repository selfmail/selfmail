import { SessionUtils } from "@selfmail/auth";
import { db } from "@selfmail/db";
import { redirect } from "@tanstack/react-router";
import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { getLoginHref } from "#/utils/href";

export const getCurrentUserFn = createServerFn({
  method: "GET",
}).handler(async () => {
  const user = await SessionUtils.getCurrentUser();

  if (!user) {
    throw redirect({
      href: getLoginHref(),
    });
  }

  return user;
});

export const authenticatedMiddleware = createMiddleware().server(
  async ({ next }) => {
    const user = await SessionUtils.getCurrentUser();

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
  permissions: string[]
) =>
  createMiddleware()
    .middleware([authenticatedMiddleware])
    .server(async ({ next, context }) => {
      const { id } = context.user;

      const permissions = await db.permission.findUnique({
        where: {
          MemberPermissions: {
            every: {
              member: {
                workspaceId,
                userId: id,
              },
            },
          },
        },
      });

      if (!permissions) {
        throw redirect({
          href: `${getLoginHref()}?error=You do not have access to this workspace`,
        });
      }

      return next({
        context: {
          permissions,
        },
      });
    });
