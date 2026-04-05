import { db } from "@selfmail/db";
import { createServerFn } from "@tanstack/react-start";
import { authenticatedMiddleware } from "./auth";

export const getWorkspaces = createServerFn({ method: "GET" })
  .middleware([authenticatedMiddleware])
  .handler(async ({ context: { user } }) => {
    const workspaces = await db.workspace.findMany({
      where: {
        Member: {
          every: {
            userId: user.id,
          },
        },
      },
    });

    return workspaces;
  });
