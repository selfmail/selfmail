import Elysia from "elysia";
import { requireAuthentication } from "../authentication";

export const workspace = new Elysia({
	prefix: "/workspace",
	detail: {
		description: "Endpoints for workspace settings",
	},
}).use(requireAuthentication);
