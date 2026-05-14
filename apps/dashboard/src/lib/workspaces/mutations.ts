import { db } from "@selfmail/db";
import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "#/utils/auth";
import { createAddressSlug } from "./address-slug";
import { defaultDomainId, defaultDomainSuffix } from "./constants";
import { getUniqueErrorTarget } from "./errors";
import {
  createAddressSchema,
  workspaceDeleteSchema,
  workspaceSettingsSchema,
} from "./schemas";
import type { CreateWorkspaceAddressResult } from "./types";

async function getOwnedWorkspace(userId: string, workspaceId: string) {
  return await db.workspace.findFirst({
    select: {
      id: true,
      slug: true,
    },
    where: {
      id: workspaceId,
      ownerId: userId,
    },
  });
}

export const createWorkspaceAddressFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(createAddressSchema)
  .handler(
    async ({
      context: { user },
      data,
    }): Promise<CreateWorkspaceAddressResult> => {
      const handle = data.handle.toLowerCase();
      const member = await db.member.findFirst({
        select: {
          id: true,
          workspace: {
            select: {
              id: true,
              ownerId: true,
              slug: true,
            },
          },
        },
        where: {
          userId: user.id,
          workspace: {
            slug: data.workspaceSlug,
          },
        },
      });

      if (!member) {
        return {
          error: "Workspace not found.",
          status: "error",
        };
      }

      const customDomain =
        data.domainId && data.domainId !== defaultDomainId
          ? await db.domain.findFirst({
              select: {
                domain: true,
                id: true,
              },
              where: {
                id: data.domainId,
                verified: true,
                workspaceId: member.workspace.id,
              },
            })
          : null;

      if (data.domainId && data.domainId !== defaultDomainId && !customDomain) {
        return {
          error: "Select a verified domain for this workspace.",
          status: "error",
        };
      }

      const domain =
        customDomain?.domain ??
        `${member.workspace.slug}.${defaultDomainSuffix}`;
      const email = `${handle}@${domain}`;

      for (let attempt = 0; attempt < 8; attempt += 1) {
        try {
          const addressSlug = createAddressSlug();
          const address = await db.$transaction(async (tx) => {
            const address = await tx.address.create({
              data: {
                addressSlug,
                domainId: customDomain?.id,
                email,
                handle,
              },
              select: {
                addressSlug: true,
                id: true,
              },
            });

            await tx.memberAddress.create({
              data: {
                addressId: address.id,
                memberId: member.id,
                role: user.id === member.workspace.ownerId ? "owner" : "member",
              },
            });

            return address;
          });

          return {
            addressSlug: address.addressSlug,
            status: "success",
          };
        } catch (error) {
          const target = getUniqueErrorTarget(error);

          if (target.has("addressSlug")) {
            continue;
          }

          if (target.has("email")) {
            return {
              error: "This email address is already taken.",
              status: "error",
            };
          }

          return {
            error:
              "We could not create this address right now. Please try again.",
            status: "error",
          };
        }
      }

      return {
        error:
          "We could not create a short address URL right now. Please try again.",
        status: "error",
      };
    }
  );

export const updateWorkspaceSettingsFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(workspaceSettingsSchema)
  .handler(async ({ context: { user }, data }) => {
    const workspace = await getOwnedWorkspace(user.id, data.workspaceId);

    if (!workspace) {
      return {
        error: "Only the workspace owner can update workspace settings.",
        status: "error" as const,
      };
    }

    const slug = data.slug.toLowerCase();
    const slugOwner = await db.workspace.findFirst({
      select: {
        id: true,
      },
      where: {
        id: {
          not: data.workspaceId,
        },
        slug,
      },
    });

    if (slugOwner) {
      return {
        error: "This workspace handle is already taken.",
        status: "error" as const,
      };
    }

    const updatedWorkspace = await db.workspace.update({
      data: {
        description: data.description?.trim() || null,
        image: data.image?.trim() || null,
        name: data.name.trim(),
        slug,
      },
      select: {
        slug: true,
      },
      where: {
        id: data.workspaceId,
      },
    });

    return {
      slug: updatedWorkspace.slug,
      status: "success" as const,
    };
  });

export const deleteWorkspaceFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(workspaceDeleteSchema)
  .handler(async ({ context: { user }, data }) => {
    const workspace = await getOwnedWorkspace(user.id, data.workspaceId);

    if (!workspace) {
      return {
        error: "Only the workspace owner can delete this workspace.",
        status: "error" as const,
      };
    }

    try {
      await db.$transaction(async (tx) => {
        const [domainAddresses, members, roles] = await Promise.all([
          tx.address.findMany({
            select: {
              id: true,
            },
            where: {
              Domain: {
                workspaceId: data.workspaceId,
              },
            },
          }),
          tx.member.findMany({
            select: {
              id: true,
            },
            where: {
              workspaceId: data.workspaceId,
            },
          }),
          tx.role.findMany({
            select: {
              id: true,
            },
            where: {
              workspaceId: data.workspaceId,
            },
          }),
        ]);
        const memberIds = members.map(({ id }) => id);
        const roleIds = roles.map(({ id }) => id);
        const memberAddresses = await tx.memberAddress.findMany({
          select: {
            addressId: true,
          },
          where: {
            memberId: {
              in: memberIds,
            },
          },
        });
        const addressIds = [
          ...new Set([
            ...domainAddresses.map(({ id }) => id),
            ...memberAddresses.map(({ addressId }) => addressId),
          ]),
        ];

        await Promise.all([
          tx.email.deleteMany({
            where: {
              addressId: {
                in: addressIds,
              },
            },
          }),
          tx.contact.deleteMany({
            where: {
              addressId: {
                in: addressIds,
              },
            },
          }),
          tx.smtpCredentials.deleteMany({
            where: {
              workspaceId: data.workspaceId,
            },
          }),
          tx.memberAddress.deleteMany({
            where: {
              OR: [
                {
                  addressId: {
                    in: addressIds,
                  },
                },
                {
                  memberId: {
                    in: memberIds,
                  },
                },
              ],
            },
          }),
          tx.draft.deleteMany({
            where: {
              workspaceId: data.workspaceId,
            },
          }),
          tx.invitation.deleteMany({
            where: {
              workspaceId: data.workspaceId,
            },
          }),
          tx.notification.deleteMany({
            where: {
              memberId: {
                in: memberIds,
              },
            },
          }),
          tx.memberPermission.deleteMany({
            where: {
              memberId: {
                in: memberIds,
              },
            },
          }),
          tx.rolePermission.deleteMany({
            where: {
              roleId: {
                in: roleIds,
              },
            },
          }),
        ]);
        await tx.address.deleteMany({
          where: {
            id: {
              in: addressIds,
            },
          },
        });
        await Promise.all([
          tx.member.deleteMany({
            where: {
              workspaceId: data.workspaceId,
            },
          }),
          tx.role.deleteMany({
            where: {
              workspaceId: data.workspaceId,
            },
          }),
          tx.domain.deleteMany({
            where: {
              workspaceId: data.workspaceId,
            },
          }),
          tx.activity.deleteMany({
            where: {
              workspaceId: data.workspaceId,
            },
          }),
        ]);
        await tx.workspace.delete({
          where: {
            id: data.workspaceId,
          },
        });
      });
    } catch {
      return {
        error:
          "We could not delete this workspace right now. Please try again.",
        status: "error" as const,
      };
    }

    return {
      status: "success" as const,
    };
  });
