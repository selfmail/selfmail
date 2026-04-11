import { describe, expect, test } from "bun:test";

import {
  createPermissionService,
  type PermissionLookup,
  resolvePermissions,
} from "./index";

describe("resolvePermissions", () => {
  test("returns requested permissions for owners", () => {
    expect(
      resolvePermissions(
        {
          isOwner: true,
          permissions: ["domains:add"],
        },
        ["domains:add", "members:remove", "domains:add"] as const
      )
    ).toEqual(["domains:add", "members:remove"]);
  });

  test("filters requested permissions against granted permissions", () => {
    expect(
      resolvePermissions(
        {
          isOwner: false,
          permissions: ["domains:add", "members:remove"],
        },
        ["settings:delete", "members:remove", "domains:add"] as const
      )
    ).toEqual(["members:remove", "domains:add"]);
  });
});

describe("createPermissionService", () => {
  test("checks all requested permissions", async () => {
    const lookup: PermissionLookup = async ({ permissions }) => ({
      isOwner: false,
      permissions: permissions.filter(
        (permission) => permission !== "domains:add"
      ),
    });

    const service = createPermissionService(lookup);

    await expect(
      service.hasPermissions({
        memberId: "member",
        permissions: ["members:remove", "domains:add"],
        workspaceId: "workspace",
      })
    ).resolves.toBe(false);
  });

  test("checks any requested permission", async () => {
    const lookup: PermissionLookup = async () => ({
      isOwner: false,
      permissions: ["settings:delete"],
    });

    const service = createPermissionService(lookup);

    await expect(
      service.hasAnyPermission({
        memberId: "member",
        permissions: ["settings:delete", "domains:update"],
        workspaceId: "workspace",
      })
    ).resolves.toBe(true);
  });
});
