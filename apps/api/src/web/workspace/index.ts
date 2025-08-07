import Elysia from "elysia";
import { requireAuthentication } from "../authentication";
import { requirePermissions } from "../permissions";

export const workspace = new Elysia({
	prefix: "/workspace",
	detail: {
		description: "Endpoints for workspace settings",
	},
})
	.use(requireAuthentication)
	.use(requirePermissions);
