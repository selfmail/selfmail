import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { name } = Route.useRouteContext();
  return <div>Hello {name}!</div>;
}
