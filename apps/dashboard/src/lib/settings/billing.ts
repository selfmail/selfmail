import { db } from "@selfmail/db";
import { Payments } from "@selfmail/payments";
import { permissions } from "@selfmail/permissions";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { authMiddleware } from "#/utils/auth";

export const getSubscription = createServerFn({ method: "GET" })
  .validator(
    z.object({
      workspaceId: z.string(),
      memberId: z.string(),
    })
  )
  .middleware([authMiddleware])
  .handler(async ({ data: { workspaceId, memberId }, context: { user } }) => {
    const member = await db.member.findUnique({
      where: {
        id: memberId,
        workspaceId,
        userId: user.id,
      },
    });

    if (!member) {
      throw new Error("Member not found");
    }

    // check permissions
    const p = await permissions({
      memberId,
      workspaceId,
      permissions: ["billings:view"],
    });

    if (!p.includes("billings:view")) {
      throw new Error("You do not have permission to view the subscription");
    }

    const payments = new Payments();

    const subscription = await payments
      .workspace(workspaceId)
      .subscription.getSubscription();

    if (!subscription) {
      return null;
    }

    if (subscription.endsAt && subscription.endsAt < new Date()) {
      return null;
    }

    return subscription;
  });
