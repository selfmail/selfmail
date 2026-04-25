import { Authentication } from "@selfmail/authentication";
import { createServerFn } from "@tanstack/react-start";
import { deleteCookie, getCookie } from "@tanstack/react-start/server";

const auth = new Authentication({ identifier: "session" });

export const getCurrentUserFn = createServerFn({
  method: "GET",
}).handler(() => {
  const cookie = getCookie(auth.COOKIE_NAME);

  if (!cookie) {
    return undefined;
  }

  return auth.getCurrentUser({ token: cookie });
});

export const getAppRedirectUrlFn = createServerFn({
  method: "GET",
}).handler(() => "https://dashboard.selfmail.localhost");

export const logoutFn = createServerFn({
  method: "POST",
}).handler(() => {
  deleteCookie(auth.COOKIE_NAME);

  return {
    success: true,
  };
});
