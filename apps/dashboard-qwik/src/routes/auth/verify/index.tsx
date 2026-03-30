import type { RequestHandler } from "@builder.io/qwik-city";
import { createAuthUrl } from "~/lib/auth";

export const onGet: RequestHandler = ({ redirect, url }) => {
  throw redirect(302, createAuthUrl(url, "/verify", url.searchParams));
};
