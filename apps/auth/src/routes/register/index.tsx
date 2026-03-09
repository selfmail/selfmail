import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/register/")({
  component: RouteComponent,
  beforeLoad() {
    // Check for any active session before showing page
  },
});

function RouteComponent() {
  return <div>Hello "/register/"!</div>;
}
