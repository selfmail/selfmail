import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
	"/_authed/$workspaceSlug/_workspace/domains/",
)({
	beforeLoad: ({ params }) => {
		throw redirect({
			params: {
				workspaceSlug: params.workspaceSlug,
			},
			search: {
				settings: "domains",
			},
			to: "/$workspaceSlug",
		});
	},
});
