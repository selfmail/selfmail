import { createFileRoute } from "@tanstack/react-router";
import { m } from "#/paraglide/messages";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <p>{m.redirect_message()}</p>;
}
