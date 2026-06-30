import { createServerFn } from "@tanstack/react-start";
import z from "zod";

export const resendMagicLinkEmail = createServerFn({
  method: "POST",
})
  .validator(
    z.object({
      email: z.email(),
    })
  )
  .handler(async ({ data: { email } }) => {
    const normalizedEmail = email.trim().toLowerCase();
  });
