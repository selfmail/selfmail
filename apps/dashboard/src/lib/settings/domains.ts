import crypto from "node:crypto";
import { db } from "@selfmail/db";
import { permissions } from "@selfmail/permissions";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { authMiddleware } from "#/utils/auth";

export const getWorkspaceDomains = createServerFn({
  method: "GET",
})
  .validator(
    z.object({
      workspaceId: z.string(),
      memberId: z.string(),
    })
  )
  .middleware([authMiddleware])
  .handler(async ({ context: { user }, data: { memberId, workspaceId } }) => {
    // Check whether the member exists
    await db.member.findUniqueOrThrow({
      where: {
        id: memberId,
        workspaceId,
        userId: user.id,
      },
    });

    const p = await permissions({
      memberId,
      workspaceId,
      permissions: ["domains:add", "domains:delete", "domains:update"],
    });

    const domains = await db.domain.findMany({
      where: {
        workspaceId,
      },
    });

    return {
      canDeleteDomains: p.includes("domains:delete"),
      canAddDomains: p.includes("domains:add"),
      canUpdateDomains: p.includes("domains:update"),

      domains,
    };
  });

export const addNewDomain = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .validator(
    z.object({
      domain: z.string().regex(z.regexes.domain),
      workspaceId: z.string(),
      memberId: z.string(),
    })
  )
  .handler(
    async ({ data: { domain, memberId, workspaceId }, context: { user } }) => {
      const member = await db.member.findUnique({
        where: {
          id: memberId,
          userId: user.id,
          workspaceId,
        },
      });

      if (!member) {
        throw new Error("Member not found");
      }

      // Check permissions
      const p = await permissions({
        memberId: member.id,
        workspaceId,
        permissions: ["domains:add"],
      });

      if (!p.includes("domains:add")) {
        throw new Error("You do not have permission to add domains");
      }

      // Check whether domain is already part of a workspace
      const existingDomain = await db.domain.findUnique({
        where: {
          domain,
        },
      });

      if (existingDomain) {
        throw new Error("Domain already exists in this workspace");
      }

      const verificationToken = `sd_${crypto.randomBytes(32).toString("base64url")}`;

      const tokenHash = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");

      const newDomain = await db.domain.create({
        data: {
          domain,
          workspaceId,
          verificationToken: tokenHash,
        },
      });

      return {
        token: verificationToken,
        domain: newDomain.domain,
      };
    }
  );

export const removeDomain = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .validator(
    z.object({
      domainId: z.string(),
      workspaceId: z.string(),
      memberId: z.string(),
    })
  )
  .handler(
    async ({
      data: { domainId, workspaceId, memberId },
      context: { user },
    }) => {
      const member = await db.member.findUnique({
        where: {
          id: memberId,
          userId: user.id,
          workspaceId,
        },
      });

      if (!member) {
        throw new Error("Member not found");
      }

      // Check permissions
      const p = await permissions({
        memberId: member.id,
        workspaceId,
        permissions: ["domains:delete"],
      });

      if (!p.includes("domains:delete")) {
        throw new Error("You do not have permission to delete domains");
      }

      // Check whether domain exists
      const existingDomain = await db.domain.findUnique({
        where: {
          id: domainId,
          workspaceId,
        },
      });

      if (!existingDomain) {
        throw new Error("Domain not found");
      }

      await db.domain.delete({
        where: {
          id: domainId,
        },
      });

      return { success: true };
    }
  );

export const verifyDomain = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .validator(
    z.object({
      domainId: z.string(),
      workspaceId: z.string(),
      memberId: z.string(),
    })
  )
  .handler(
    async ({
      data: { domainId, workspaceId, memberId },
      context: { user },
    }) => {
      const member = await db.member.findUnique({
        where: {
          id: memberId,
          userId: user.id,
          workspaceId,
        },
      });

      if (!member) {
        throw new Error("Member not found");
      }

      // Check permissions
      const p = await permissions({
        memberId: member.id,
        workspaceId,
        permissions: ["domains:update"],
      });

      if (!p.includes("domains:update")) {
        throw new Error("You do not have permission to verify domains");
      }

      // Check whether domain exists
      const existingDomain = await db.domain.findUnique({
        where: {
          id: domainId,
          workspaceId,
        },
      });

      if (!existingDomain) {
        throw new Error("Domain not found");
      }

      // Verify Domain records

      // Verify the domain
      await db.domain.update({
        where: {
          id: domainId,
        },
        data: {
          verified: true,
        },
      });

      return { success: true };
    }
  );
