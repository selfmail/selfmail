import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad(_) {
    Route.redirect({
      to: "/login",
    });
  },
  component: RouteComponent,
});

function RouteComponent() {
  throw redirect({
    to: "/login",
  });
}
