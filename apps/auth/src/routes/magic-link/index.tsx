import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/magic-link/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/magic-link/"!</div>;
}
