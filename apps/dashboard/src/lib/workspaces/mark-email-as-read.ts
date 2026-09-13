import { db } from "@selfmail/db";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { m } from "#/paraglide/messages";
import { authMiddleware } from "#/utils/auth";

export const markEmailAsReadFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ emailId: z.string().min(1) }))
  .handler(async ({ context: { user }, data: { emailId } }) => {
    const { count } = await db.email.updateMany({
      data: {
        read: true,
        readAt: new Date(),
      },
      where: {
        id: emailId,
        address: {
          MemberAddress: {
            some: {
              member: { userId: user.id },
            },
          },
        },
      },
    });

    if (count === 0) {
      throw new Response(m["dashboard.errors.email_not_found"](), {
        status: 404,
      });
    }

    return { success: true };
  });
