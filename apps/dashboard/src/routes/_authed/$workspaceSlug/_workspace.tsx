import { createFileRoute } from "@tanstack/react-router";
import { getWorkspace } from "#/lib/workspaces";

export const Route = createFileRoute(
  "/_authed/$workspaceSlug/_workspace"
)({
  beforeLoad: async ({ params }) => {
    const { workspaceSlug } = params;
    console.log("Loading workspace with slug:", workspaceSlug);
    if (!workspaceSlug) {
      throw new Response("Workspace slug is required", { status: 400 });
    }

    const { workspace, member } = await getWorkspace({
      data: {
        workspaceSlug,
      },
    });

    if (!(workspace && member)) {
      throw new Response("Workspace not found", { status: 404 });
    }

    return {
      workspace,
      member,
    };
  },
});
