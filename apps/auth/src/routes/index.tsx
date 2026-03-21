import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { m } from "#/paraglide/messages";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Selfmail" },
      {
        name: "description",
        content: "Secure email management platform.",
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  useEffect(() => {
    window.location.href = "/login";
  });
  return <p>{m.redirect_message()}</p>;
}
