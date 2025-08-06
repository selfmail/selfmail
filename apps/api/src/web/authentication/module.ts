import { t } from "elysia";

export namespace AuthenticationModule {
	export const registerBody = t.Object({
		email: t.String({
			format: "email",
		}),
		password: t.String({
			error: "Invalid Password.",
			minLength: 8,
			maxLength: 128,
			description: "Password to access the dashboard.",
		}),
		name: t.String({
			minLength: 3,
			maxLength: 64,
		}),
	});

	export type RegisterBody = typeof registerBody.static;

	// Login

	export const loginBody = t.Object({
		email: t.String({
			format: "email",
		}),
		password: t.String({
			error: "Invalid Password.",
			minLength: 8,
			maxLength: 128,
			description: "Password to access the dashboard.",
		}),
	});

	export type LoginBody = typeof loginBody.static;
}
