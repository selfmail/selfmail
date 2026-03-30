import type { RequestHandler } from "@builder.io/qwik-city";
import { createRegisterUrl } from "~/lib/auth";

export const onGet: RequestHandler = ({ redirect, url }) => {
  throw redirect(302, createRegisterUrl(url, url.searchParams));
};
