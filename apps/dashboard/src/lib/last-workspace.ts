import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { authMiddleware } from "#/utils/auth";

const lastWorkspaceCookie = "selfmail-last-workspace";

export const getLastWorkspaceFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(() => getCookie(lastWorkspaceCookie) ?? null);

export function rememberWorkspace(workspaceSlug: string) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  // biome-ignore lint/suspicious/noDocumentCookie: Persist navigation in browsers without Cookie Store API support.
  document.cookie = `${lastWorkspaceCookie}=${encodeURIComponent(workspaceSlug)}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
}
