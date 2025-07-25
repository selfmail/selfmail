import Elysia from "elysia";
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
