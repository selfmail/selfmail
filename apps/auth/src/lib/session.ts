import { createServerFn } from "@tanstack/react-start";
import { SessionUtils } from "#/utils/session.server";

export const getCurrentUserFn = createServerFn({
	method: "GET",
}).handler(() => SessionUtils.getCurrentUser());

export const getAppRedirectUrlFn = createServerFn({
	method: "GET",
}).handler(() => SessionUtils.getAppRedirectUrl());

export const logoutFn = createServerFn({
	method: "POST",
}).handler(async () => {
	await SessionUtils.destroySession();

	return { success: true };
});
