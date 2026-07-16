import { audit } from "@selfmail/audit";
import { db } from "@selfmail/db";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { authMiddleware } from "#/utils/auth";

export const getMemberAddresses = createServerFn({
  method: "GET",
})
  .middleware([authMiddleware])
  .validator(
    z.object({
      workspaceSlug: z.string(),
    })
  )
  .handler(async ({ context: { user }, data: { workspaceSlug } }) => {
    const memberAddresses = await db.memberAddress.findMany({
      select: {
        address: {
          select: {
            addressSlug: true,
            email: true,
            handle: true,
            id: true,
          },
        },
      },
      where: {
        member: {
          userId: user.id,
          workspace: {
            slug: workspaceSlug,
          },
        },
      },
    });

    return memberAddresses
      .map(({ address }) => address)
      .sort((first, second) => first.email.localeCompare(second.email));
  });

export const createMemberAddress = createServerFn({ method: "POST" })
  .validator(
    z.object({
      handle: z.string(),
      domain: z.string(),
      memberId: z.string(),
    })
  )
  .middleware([authMiddleware])
  .handler(
    async ({ data: { handle, domain, memberId }, context: { user } }) => {
      const member = await db.member.findUnique({
        where: {
          id: memberId,
          userId: user.id,
        },
        select: {
          id: true,
          workspaceId: true,
        },
      });

      if (!member) {
        throw new Error("Member not found.");
      }

      const workspaceDomain = await db.domain.findUnique({
        where: {
          domain,

          OR: [{ public: true }, { workspaceId: member.workspaceId }],
        },
      });

      if (!workspaceDomain) {
        throw new Error("Domain not found.");
      }

      // Check whehter adress already exists
      const address = await db.address.findUnique({
        where: {
          handle_domainId: {
            domainId: workspaceDomain.id,
            handle,
          },
        },
      });

      if (address) {
        throw new Error("Address already exists.");
      }

      const newAddress = await db.address.create({
        data: {
          email: `${handle}@${domain}`,
          domainId: workspaceDomain.id,
          handle,
        },
      });

      if (!newAddress) {
        throw new Error(
          "Error while creating address, please try again later!"
        );
      }

      await audit({
        tenantId: member.workspaceId,
        action: "mailbox.created",
        actor: {
          type: "user",
        },
        metadata: {
          address: `${handle}@${domain}`,
          memberId,
        },
      });
    }
  );
