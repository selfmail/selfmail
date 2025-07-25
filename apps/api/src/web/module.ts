import { t } from "elysia";

export namespace WebModule {
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
	});

	export type RegisterBody = typeof registerBody.static;
}
