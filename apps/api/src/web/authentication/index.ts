import Elysia, { status, t } from "elysia";
import { AuthenticationModule } from "./module";
import { AuthenticationService } from "./service";

export const authentication = new Elysia({
	prefix: "/authentication",
	detail: {
		description: "Authentication endpoints for user registration and login.",
	},
})
	.post(
		"/login",
		async ({ body }) => {
			return await AuthenticationService.handleLogin(body);
		},
		{
			body: AuthenticationModule.loginBody,
		},
	)
	.post(
		"/register",
		async ({ body }) => {
			return await AuthenticationService.handleRegister(body);
		},
		{
			body: AuthenticationModule.registerBody,
		},
	);

export const requireAuthentication = new Elysia({
	detail: {
		description: "Required Authentication for dashboard and workspace routes.",
	},
})
	.state("user", "")
	.derive(({ store }) => ({
		user({ email }: { email: string }) {
			store.user = email;
		},
	}))
	.onBeforeHandle(({ cookie, user }) => {
		if (!cookie.authentication.value) throw status(403);

		user({
			email: "sfdlds",
		});
	});

export const requiredAuthenticationCookieSchema = t.Object({
	authentication: t.Cookie({}, {}),
});
