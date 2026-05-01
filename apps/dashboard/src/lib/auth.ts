import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "#/utils/auth";

export const getUser = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(({ context: { user } }) => {
    return {
      user,
    };
  });
