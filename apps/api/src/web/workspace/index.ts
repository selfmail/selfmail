import Elysia from "elysia";

export const workspace = new Elysia({
	prefix: "/workspace",
	detail: {
		description: "Endpoints for workspace settings",
	},
});
