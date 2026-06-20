import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { authMiddleware } from "#/utils/auth";

export const getMemberPermissions = createServerFn()
  .middleware([authMiddleware])
  .validator(
    z.object({
      workspaceId: z.string(),
    })
  )
  .handler(async ({ context }) => {
    return {
      context,
    };
  });
