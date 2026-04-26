import { db } from "@selfmail/db";
import {
  permissions as getPermissions,
  hasAnyPermission,
  type PermissionName,
} from "@selfmail/permissions";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "./auth";

const BILLING_ACCESS_ERROR = "You do not have access to this workspace";

const getBillingHomeHref = (error?: string) =>
	error ? `/?error=${encodeURIComponent(error)}` : "/";

export const getWorkspaces = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context: { user } }) => {
    const workspaces = await db.workspace.findMany({
      where: {
        Member: {
          some: {
            userId: user.id,
          },
        },
      },
    });

    return workspaces;
  });

export const workspaceViewPermissions = [
  "settings:update-workspace",
  "settings:delete",
] as const satisfies readonly PermissionName[];

interface WorkspaceAccessInput {
  requiredPermissions?: readonly PermissionName[];
  workspaceId: string;
}

export const getWorkspaceAccess = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .inputValidator((input: WorkspaceAccessInput) => input)
  .handler(async ({ context: { user }, data }) => {
    const workspace = await db.workspace.findFirst({
      where: {
        id: data.workspaceId,
        Member: {
          some: {
            userId: user.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        ownerId: true,
        Member: {
          where: {
            userId: user.id,
          },
          select: {
            id: true,
          },
          take: 1,
        },
      },
    });

    const member = workspace?.Member[0];

    if (!(workspace && member)) {
      throw redirect({
        href: getBillingHomeHref(BILLING_ACCESS_ERROR),
      });
    }

    const requiredPermissions = data.requiredPermissions?.length
      ? data.requiredPermissions
      : workspaceViewPermissions;

    const allowed =
      requiredPermissions.length === 0
        ? true
        : await hasAnyPermission({
            memberId: member.id,
            permissions: requiredPermissions,
            workspaceId: workspace.id,
          });

    if (!allowed) {
      throw redirect({
        href: getBillingHomeHref(BILLING_ACCESS_ERROR),
      });
    }

    const permissions =
      requiredPermissions.length === 0
        ? []
        : await getPermissions({
            memberId: member.id,
            permissions: requiredPermissions,
            workspaceId: workspace.id,
          });

    return {
      memberId: member.id,
      permissions,
      workspace: {
        id: workspace.id,
        name: workspace.name,
        ownerId: workspace.ownerId,
      },
    };
  });
