import { db } from "@selfmail/db";

export const permissionNames = [
  "domains:add",
  "domains:delete",
  "domains:update",
  "invite:member",
  "members:invite",
  "members:remove",
  "settings:delete",
  "settings:update-workspace",
] as const;

export type PermissionName = (typeof permissionNames)[number];

export type PermissionRequest<TPermission extends string = PermissionName> = {
  memberId: string;
  permissions: readonly TPermission[];
  workspaceId: string;
};

export type PermissionSnapshot<TPermission extends string = PermissionName> = {
  isOwner: boolean;
  permissions: readonly TPermission[];
};

export type PermissionLookup = (
  request: PermissionRequest<PermissionName>
) => Promise<PermissionSnapshot | null>;

const uniquePermissions = <const TPermission extends string>(
  permissions: readonly TPermission[]
): TPermission[] => [...new Set(permissions)];

export const isPermissionName = (
  permission: string
): permission is PermissionName =>
  (permissionNames as readonly string[]).includes(permission);

export const resolvePermissions = <const TPermission extends string>(
  snapshot: PermissionSnapshot<TPermission> | null,
  requestedPermissions: readonly TPermission[]
): TPermission[] => {
  const uniqueRequestedPermissions = uniquePermissions(requestedPermissions);

  if (!snapshot) {
    return [];
  }

  if (snapshot.isOwner) {
    return uniqueRequestedPermissions;
  }

  const grantedPermissions = new Set(snapshot.permissions);

  return uniqueRequestedPermissions.filter((permission) =>
    grantedPermissions.has(permission)
  );
};

export const createPermissionService = (lookup: PermissionLookup) => {
  const permissions = async <const TPermission extends PermissionName>({
    permissions: requestedPermissions,
    ...request
  }: PermissionRequest<TPermission>): Promise<TPermission[]> => {
    const snapshot = await lookup({
      ...request,
      permissions: requestedPermissions,
    });

    return resolvePermissions(
      snapshot as PermissionSnapshot<TPermission> | null,
      requestedPermissions
    );
  };

  const hasPermissions = async <const TPermission extends PermissionName>(
    request: PermissionRequest<TPermission>
  ): Promise<boolean> =>
    (await permissions(request)).length ===
    uniquePermissions(request.permissions).length;

  const hasAnyPermission = async <const TPermission extends PermissionName>(
    request: PermissionRequest<TPermission>
  ): Promise<boolean> => (await permissions(request)).length > 0;

  return {
    hasAnyPermission,
    hasPermissions,
    permissions,
  };
};

const lookupPermissions: PermissionLookup = async ({
  memberId,
  permissions: requestedPermissions,
  workspaceId,
}) => {
  const uniqueRequestedPermissions = uniquePermissions(requestedPermissions);
  const member = await db.member.findUnique({
    where: {
      id: memberId,
      workspaceId,
    },
    select: {
      userId: true,
      MemberPermission: {
        select: {
          permissionName: true,
        },
        where: {
          permissionName: {
            in: uniqueRequestedPermissions,
          },
        },
      },
      roles: {
        select: {
          RolePermission: {
            select: {
              permission: {
                select: {
                  name: true,
                },
              },
            },
            where: {
              permission: {
                name: {
                  in: uniqueRequestedPermissions,
                },
              },
            },
          },
        },
      },
      workspace: {
        select: {
          ownerId: true,
        },
      },
    },
  });

  if (!member) {
    return null;
  }

  const grantedPermissions = new Set<PermissionName>();

  for (const permission of member.MemberPermission) {
    if (isPermissionName(permission.permissionName)) {
      grantedPermissions.add(permission.permissionName);
    }
  }

  for (const role of member.roles) {
    for (const rolePermission of role.RolePermission) {
      if (isPermissionName(rolePermission.permission.name)) {
        grantedPermissions.add(rolePermission.permission.name);
      }
    }
  }

  return {
    isOwner: member.userId === member.workspace.ownerId,
    permissions: [...grantedPermissions],
  };
};

export const { hasAnyPermission, hasPermissions, permissions } =
  createPermissionService(lookupPermissions);
