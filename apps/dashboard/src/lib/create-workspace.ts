import { db } from "@selfmail/db";
import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "#/utils/auth";

export const getUserAllowedToCreateWorkspace = createServerFn({
  method: "GET",
})
  .middleware([authMiddleware])
  .handler(async ({ context: { user } }) => {
    const workspaces = await db.member.count({
      where: {
        userId: user.id,
      },
    });
    return {
      isAllowed: workspaces <= user.maxWorkspaces,
    };
  });
