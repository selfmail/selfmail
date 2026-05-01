import { createFileRoute, Outlet } from "@tanstack/react-router";
import { getUser } from "#/lib/auth";

export const Route = createFileRoute("/_authed")({
  beforeLoad: async () => {
    const { user } = await getUser();
    return {
      user,
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
