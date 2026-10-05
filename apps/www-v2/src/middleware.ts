import { defineMiddleware } from "astro:middleware";
import { getLocale } from "./paraglide/runtime.js";
import { paraglideMiddleware } from "./paraglide/server.js";

export const onRequest = defineMiddleware((context, next) =>
  paraglideMiddleware(context.request, async () => {
    const response = await next();
    response.headers.set("Content-Language", getLocale());
    // Cookie-selected HTML must not be shared between visitors by a CDN.
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.append("Vary", "Cookie, Accept-Language");
    return response;
  })
);
