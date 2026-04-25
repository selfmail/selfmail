import type { Workspace } from "@selfmail/db";
import { createFileRoute } from "@tanstack/react-router";
import { getWorkspaces } from "#/lib/workspaces";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    error: typeof search.error === "string" ? search.error : undefined,
  }),
  head: () => ({
    meta: [
      {
        title: "Billing Portal | Selfmail",
      },
      {
        name: "description",
        content:
          "Manage your Selfmail subscription, billing details, and invoices in one place.",
      },
    ],
  }),
  loader: async (): Promise<{ workspaces: Workspace[] }> => ({
    workspaces: await getWorkspaces(),
  }),
  component: App,
});

function App() {
  const { error } = Route.useSearch();
  const { workspaces } = Route.useLoaderData();

  return (
    <>
      <a
        className="absolute top-5 hidden font-medium text-xl sm:block"
        href="https://selfmail.app"
      >
        Selfmail
      </a>
      <section className="flex flex-col space-y-3">
        <h1 className="text-2xl">Select your Workspace</h1>
        {error ? (
          <p
            aria-live="polite"
            className="text-pretty rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        {workspaces.length === 0 ? (
          <p className="text-muted">You are not a member of any workspaces.</p>
        ) : (
          <div className="flex flex-col space-y-2">
            {workspaces.map((workspace: Workspace) => (
              <a
                className="w-full rounded-full border border-gray-200 p-4 hover:bg-gray-50"
                href={`/${workspace.id}`}
                key={workspace.id}
              >
                {workspace.name}
              </a>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
