import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_authed/onboarding/")({
  component: RouteComponent,
});

function RouteComponent() {
  // Component with stepper from transitions.dev
  const [page, setPage] = useState(0);
  const pages = [];
  return (
    <div>
      <p>Hello "/_authed/onboarding/"!</p>
      <p>Current page: {page}</p>
      <button
        disabled={page === 0}
        onClick={() => setPage((p) => p - 1)}
        type="button"
      >
        Previous
      </button>
      <button
        disabled={page === 2}
        onClick={() => setPage((p) => p + 1)}
        type="button"
      >
        Next
      </button>
    </div>
  );
}
