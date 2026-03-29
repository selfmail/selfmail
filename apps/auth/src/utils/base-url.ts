import { createServerFn } from "@tanstack/react-start";
import z from "zod";

export const getBaseUrl = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      subdomain: z.string().optional(),
    })
  )
  .handler(({ data: { subdomain } }) => {
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

    if (process.env.NODE_ENV === "production") {
      const domain = "selfmail.app";
      return `${protocol}://${subdomain ? `${subdomain}.` : ""}${domain}`;
    }
    return `http://${subdomain ? `${subdomain}.` : ""}selfmail.localhost:1355`;
  });
