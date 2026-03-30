import type { RequestHandler } from "@builder.io/qwik-city";
import { createLoginUrl } from "~/lib/auth";

export const onGet: RequestHandler = ({ redirect, url }) => {
  throw redirect(
    302,
    createLoginUrl(url, {
      error: "GitHub sign-in is no longer available in dashboard-qwik.",
    })
  );
};
