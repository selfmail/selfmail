import { db } from "@selfmail/db";
import { permissions as getPermissions } from "@selfmail/permissions";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { m } from "#/paraglide/messages";
import { authMiddleware } from "#/utils/auth";
import { defaultDomainId, defaultDomainSuffix } from "./constants";
import {
  detectDnsProvider,
  toDashboardWorkspaceDomain,
} from "./domain-presenter";
import { toDashboardEmail } from "./email-format";
import { addressInboxSchema, workspaceSlugSchema } from "./schemas";
import type {
  DashboardAddressDomain,
  DashboardAddressInboxData,
  DashboardInboxData,
  DashboardWorkspace,
  DashboardWorkspaceDomainsData,
  DashboardWorkspaceMembersData,
  DashboardWorkspaceSettingsData,
  WorkspaceDataExportResult,
  WorkspaceDataExportValue,
} from "./types";

function toExportValue(value: unknown): WorkspaceDataExportValue {
  if (value === null) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(toExportValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        toExportValue(nestedValue),
      ])
    );
  }

  return null;
}

async function getMemberAddresses(userId: string, workspaceSlug: string) {
  const memberAddresses = await db.memberAddress.findMany({
    select: {
      address: {
        select: {
          _count: {
            select: {
              Email: true,
            },
          },
          addressSlug: true,
          email: true,
          handle: true,
          id: true,
        },
      },
    },
    where: {
      member: {
        userId,
        workspace: {
          slug: workspaceSlug,
        },
      },
    },
  });

  return memberAddresses
    .map(({ address }) => address)
    .sort(
      (first, second) =>
        second._count.Email - first._count.Email ||
        first.email.localeCompare(second.email)
    )
    .map(({ _count, ...address }) => address);
}

async function getAddressEmails(addressIds: string[]) {
  if (addressIds.length === 0) {
    return [];
  }

  const emails = await db.email.findMany({
    orderBy: {
      date: "desc",
    },
    select: {
      address: {
        select: {
          email: true,
        },
      },
      attachments: true,
      date: true,
      from: true,
      id: true,
      read: true,
      subject: true,
      text: true,
    },
    take: 50,
    where: {
      addressId: {
        in: addressIds,
      },
    },
  });

  return emails.map(toDashboardEmail);
}

export const getWorkspace = createServerFn({
  method: "GET",
})
  .middleware([authMiddleware])
  .validator(
    z.object({
      workspaceSlug: z.string().min(1),
    })
  )
  .handler(async ({ context: { user }, data: { workspaceSlug } }) => {
    const member = await db.member.findFirst({
      select: {
        id: true,
        workspace: {
          select: {
            id: true,
            description: true,
            image: true,
            name: true,
            ownerId: true,
            slug: true,
          },
        },
      },
      where: {
        userId: user.id,
        workspace: {
          slug: workspaceSlug,
        },
      },
    });

    return {
      member: member ? { id: member.id } : null,
      workspace: member
        ? {
            id: member.workspace.id,
            description: member.workspace.description,
            image: member.workspace.image,
            memberId: member.id,
            name: member.workspace.name,
            ownerId: member.workspace.ownerId,
            slug: member.workspace.slug,
          }
        : null,
    };
  });

export const getDashboardWorkspacesFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context: { user } }): Promise<DashboardWorkspace[]> => {
    const workspaces = await db.workspace.findMany({
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        image: true,
        Member: {
          select: {
            id: true,
          },
          take: 1,
          where: {
            userId: user.id,
          },
        },
        name: true,
        description: true,
        ownerId: true,
        slug: true,
      },
      where: {
        Member: {
          some: {
            userId: user.id,
          },
        },
      },
    });

    return workspaces.flatMap((workspace) => {
      const member = workspace.Member[0];

      return member
        ? [
            {
              id: workspace.id,
              description: workspace.description,
              image: workspace.image,
              memberId: member.id,
              name: workspace.name,
              ownerId: workspace.ownerId,
              slug: workspace.slug,
            },
          ]
        : [];
    });
  });

export const getWorkspaceInboxFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(workspaceSlugSchema)
  .handler(
    async ({
      context: { user },
      data: { workspaceSlug },
    }): Promise<DashboardInboxData> => {
      const addresses = await getMemberAddresses(user.id, workspaceSlug);
      const emails = await getAddressEmails(addresses.map(({ id }) => id));

      return {
        addresses,
        emails,
      };
    }
  );

export const getAddressInboxFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(addressInboxSchema)
  .handler(
    async ({
      context: { user },
      data: { addressSlug, workspaceSlug },
    }): Promise<DashboardAddressInboxData> => {
      const addresses = await getMemberAddresses(user.id, workspaceSlug);
      const address = addresses.find(
        (currentAddress) => currentAddress.addressSlug === addressSlug
      );

      if (!address) {
        throw new Response(m["dashboard.errors.address_not_found"](), {
          status: 404,
        });
      }

      const emails = await getAddressEmails([address.id]);

      return {
        address,
        addresses,
        emails,
      };
    }
  );

export const getDashboardEmailFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      emailId: z.string().min(1),
    })
  )
  .handler(async ({ context: { user }, data: { emailId } }) => {
    const email = await db.email.findFirst({
      select: {
        address: {
          select: {
            email: true,
          },
        },
        attachments: true,
        date: true,
        from: true,
        id: true,
        read: true,
        subject: true,
        text: true,
      },
      where: {
        id: emailId,
        address: {
          MemberAddress: {
            some: {
              member: {
                userId: user.id,
              },
            },
          },
        },
      },
    });

    if (!email) {
      throw new Response(m["dashboard.errors.email_not_found"](), {
        status: 404,
      });
    }

    return toDashboardEmail(email);
  });

export const getWorkspaceAddressDomainsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(workspaceSlugSchema)
  .handler(
    async ({
      context: { user },
      data: { workspaceSlug },
    }): Promise<DashboardAddressDomain[]> => {
      const workspace = await db.workspace.findFirst({
        select: {
          id: true,
          slug: true,
          Domain: {
            orderBy: {
              domain: "asc",
            },
            select: {
              domain: true,
              id: true,
            },
            where: {
              verified: true,
            },
          },
        },
        where: {
          slug: workspaceSlug,
          Member: {
            some: {
              userId: user.id,
            },
          },
        },
      });

      if (!workspace) {
        throw new Response(m["dashboard.errors.workspace_not_found"](), {
          status: 404,
        });
      }

      return [
        {
          domain: `${workspace.slug}.${defaultDomainSuffix}`,
          id: defaultDomainId,
          type: "default",
        },
        ...workspace.Domain.map((domain) => ({
          domain: domain.domain,
          id: domain.id,
          type: "custom" as const,
        })),
      ];
    }
  );

export const getWorkspaceDomainsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(workspaceSlugSchema)
  .handler(
    async ({
      context: { user },
      data: { workspaceSlug },
    }): Promise<DashboardWorkspaceDomainsData> => {
      const currentMember = await db.member.findFirst({
        select: {
          id: true,
          workspace: {
            select: {
              id: true,
              Domain: {
                orderBy: {
                  createdAt: "desc",
                },
                select: {
                  _count: {
                    select: {
                      addresses: true,
                    },
                  },
                  createdAt: true,
                  domain: true,
                  id: true,
                  verificationToken: true,
                  verified: true,
                  verifiedAt: true,
                },
              },
            },
          },
        },
        where: {
          userId: user.id,
          workspace: {
            slug: workspaceSlug,
          },
        },
      });

      if (!currentMember) {
        throw new Response(m["dashboard.errors.workspace_not_found"](), {
          status: 404,
        });
      }

      const grantedPermissions = await getPermissions({
        memberId: currentMember.id,
        permissions: ["domains:add", "domains:delete", "domains:update"],
        workspaceId: currentMember.workspace.id,
      });
      const domains = await Promise.all(
        currentMember.workspace.Domain.map(async (domain) =>
          toDashboardWorkspaceDomain(
            domain,
            await detectDnsProvider(domain.domain)
          )
        )
      );

      return {
        canAddDomains: grantedPermissions.includes("domains:add"),
        canDeleteDomains: grantedPermissions.includes("domains:delete"),
        canVerifyDomains:
          grantedPermissions.includes("domains:add") ||
          grantedPermissions.includes("domains:update"),
        domains,
      };
    }
  );

export const getWorkspaceMembersFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(workspaceSlugSchema)
  .handler(
    async ({
      context: { user },
      data: { workspaceSlug },
    }): Promise<DashboardWorkspaceMembersData> => {
      const currentMember = await db.member.findFirst({
        select: {
          id: true,
          workspace: {
            select: {
              id: true,
              ownerId: true,
              Member: {
                orderBy: {
                  createdAt: "asc",
                },
                select: {
                  id: true,
                  image: true,
                  profileName: true,
                  storageBytes: true,
                  createdAt: true,
                  userId: true,
                  user: {
                    select: {
                      email: true,
                    },
                  },
                  MemberAddress: {
                    select: {
                      addressId: true,
                    },
                  },
                  MemberPermission: {
                    select: {
                      permissionName: true,
                    },
                  },
                  roles: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        where: {
          userId: user.id,
          workspace: {
            slug: workspaceSlug,
          },
        },
      });

      if (!currentMember) {
        throw new Response(m["dashboard.errors.workspace_not_found"](), {
          status: 404,
        });
      }

      const removePermissions = await getPermissions({
        memberId: currentMember.id,
        permissions: ["members:remove"],
        workspaceId: currentMember.workspace.id,
      });
      const canRemoveMembers = removePermissions.includes("members:remove");

      return {
        canRemoveMembers,
        members: currentMember.workspace.Member.map((member) => ({
          addressCount: member.MemberAddress.length,
          email: member.user.email,
          id: member.id,
          image: member.image,
          isCurrentMember: member.id === currentMember.id,
          isOwner: member.userId === currentMember.workspace.ownerId,
          joinedAt: member.createdAt.toISOString(),
          permissions: member.MemberPermission.map(
            (permission) => permission.permissionName
          ),
          profileName: member.profileName,
          roles: member.roles.map((role) => role.name),
          storageBytes: member.storageBytes.toString(),
        })),
      };
    }
  );

export const getWorkspaceSettingsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(workspaceSlugSchema)
  .handler(
    async ({
      context: { user },
      data: { workspaceSlug },
    }): Promise<DashboardWorkspaceSettingsData> => {
      const currentMember = await db.member.findFirst({
        select: {
          id: true,
          userId: true,
          workspace: {
            select: {
              _count: {
                select: {
                  Domain: true,
                  Draft: true,
                  Member: true,
                },
              },
              createdAt: true,
              description: true,
              id: true,
              name: true,
              ownerId: true,
              slug: true,
              updatedAt: true,
            },
          },
        },
        where: {
          userId: user.id,
          workspace: {
            slug: workspaceSlug,
          },
        },
      });

      if (!currentMember) {
        throw new Response(m["dashboard.errors.workspace_not_found"](), {
          status: 404,
        });
      }

      const addressLinks = await db.memberAddress.findMany({
        select: {
          addressId: true,
        },
        where: {
          member: {
            workspaceId: currentMember.workspace.id,
          },
        },
      });
      const addressIds = [
        ...new Set(addressLinks.map(({ addressId }) => addressId)),
      ];
      const [emailCount, storage] = await Promise.all([
        addressIds.length
          ? db.email.count({
              where: {
                addressId: {
                  in: addressIds,
                },
              },
            })
          : 0,
        addressIds.length
          ? db.address.aggregate({
              _sum: {
                usedStorageBytes: true,
              },
              where: {
                id: {
                  in: addressIds,
                },
              },
            })
          : null,
      ]);
      const grantedPermissions = await getPermissions({
        memberId: currentMember.id,
        permissions: ["workspace:delete", "workspace:update"],
        workspaceId: currentMember.workspace.id,
      });

      return {
        counts: {
          addresses: addressIds.length,
          domains: currentMember.workspace._count.Domain,
          drafts: currentMember.workspace._count.Draft,
          emails: emailCount,
          members: currentMember.workspace._count.Member,
          storageBytes: (
            storage?._sum.usedStorageBytes ?? BigInt(0)
          ).toString(),
        },
        permissions: {
          canDeleteWorkspace: grantedPermissions.includes("workspace:delete"),
          canUpdateWorkspace: grantedPermissions.includes("workspace:update"),
        },
        workspace: {
          createdAt: currentMember.workspace.createdAt.toISOString(),
          defaultDomain: `${currentMember.workspace.slug}.${defaultDomainSuffix}`,
          description: currentMember.workspace.description,
          id: currentMember.workspace.id,
          isOwner: currentMember.userId === currentMember.workspace.ownerId,
          name: currentMember.workspace.name,
          slug: currentMember.workspace.slug,
          updatedAt: currentMember.workspace.updatedAt.toISOString(),
        },
      };
    }
  );

export const exportWorkspaceDataFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(workspaceSlugSchema)
  .handler(
    async ({
      context: { user },
      data: { workspaceSlug },
    }): Promise<WorkspaceDataExportResult> => {
      const currentMember = await db.member.findFirst({
        select: {
          MemberPermission: {
            select: {
              permissionName: true,
            },
          },
          createdAt: true,
          description: true,
          id: true,
          image: true,
          profileName: true,
          roles: {
            select: {
              name: true,
            },
          },
          storageBytes: true,
          workspace: {
            select: {
              description: true,
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        where: {
          userId: user.id,
          workspace: {
            slug: workspaceSlug,
          },
        },
      });

      if (!currentMember) {
        return {
          error: m["dashboard.errors.workspace_not_found"](),
          status: "error",
        };
      }

      const memberAddresses = await db.memberAddress.findMany({
        select: {
          role: true,
          address: {
            select: {
              addressSlug: true,
              domainId: true,
              email: true,
              handle: true,
              id: true,
              usedStorageBytes: true,
            },
          },
        },
        where: {
          memberId: currentMember.id,
        },
      });
      const addressIds = memberAddresses.map(({ address }) => address.id);
      const [contacts, drafts, emails, notifications, smtpCredentials] =
        await Promise.all([
          db.contact.findMany({
            orderBy: {
              email: "asc",
            },
            select: {
              additionalInformation: true,
              addressId: true,
              blocked: true,
              description: true,
              email: true,
              id: true,
              image: true,
              name: true,
            },
            where: {
              addressId: {
                in: addressIds,
              },
            },
          }),
          db.draft.findMany({
            orderBy: {
              updatedAt: "desc",
            },
            select: {
              bcc: true,
              body: true,
              cc: true,
              createdAt: true,
              from: true,
              id: true,
              public: true,
              subject: true,
              title: true,
              to: true,
              updatedAt: true,
            },
            where: {
              memberId: currentMember.id,
            },
          }),
          db.email.findMany({
            orderBy: {
              date: "desc",
            },
            select: {
              addressId: true,
              attachments: true,
              bcc: true,
              cc: true,
              contactId: true,
              createdAt: true,
              date: true,
              from: true,
              headers: true,
              html: true,
              id: true,
              messageId: true,
              processed: true,
              processingError: true,
              rawEmail: true,
              read: true,
              readAt: true,
              replyTo: true,
              sizeBytes: true,
              sort: true,
              spamScore: true,
              subject: true,
              text: true,
              to: true,
              updatedAt: true,
              virusStatus: true,
              warning: true,
            },
            where: {
              addressId: {
                in: addressIds,
              },
            },
          }),
          db.notification.findMany({
            orderBy: {
              createdAt: "desc",
            },
            select: {
              createdAt: true,
              id: true,
              message: true,
              read: true,
              readAt: true,
              title: true,
              type: true,
            },
            where: {
              OR: [
                {
                  memberId: currentMember.id,
                },
                {
                  userId: user.id,
                },
              ],
            },
          }),
          db.smtpCredentials.findMany({
            orderBy: {
              createdAt: "desc",
            },
            select: {
              activeUntil: true,
              addressId: true,
              createdAt: true,
              description: true,
              id: true,
              passwordViewedAt: true,
              title: true,
              updatedAt: true,
              username: true,
            },
            where: {
              memberId: currentMember.id,
            },
          }),
        ]);

      return {
        data: {
          data: {
            addresses: memberAddresses.map(({ address, role }) => ({
              ...address,
              role,
              usedStorageBytes: address.usedStorageBytes.toString(),
            })),
            contacts: contacts.map(toExportValue),
            drafts: drafts.map(toExportValue),
            emails: emails.map(toExportValue),
            notifications: notifications.map(toExportValue),
            smtpCredentials: smtpCredentials.map((credential) =>
              toExportValue({
                ...credential,
                passwordRedacted: true,
              })
            ),
          },
          exportedAt: new Date().toISOString(),
          member: {
            createdAt: currentMember.createdAt.toISOString(),
            description: currentMember.description,
            id: currentMember.id,
            image: currentMember.image,
            permissions: currentMember.MemberPermission.map(
              (permission) => permission.permissionName
            ),
            profileName: currentMember.profileName,
            roles: currentMember.roles.map((role) => role.name),
            storageBytes: currentMember.storageBytes.toString(),
          },
          user: {
            email: user.email,
            id: user.id,
            name: user.name,
          },
          workspace: currentMember.workspace,
        },
        status: "success",
      };
    }
  );
