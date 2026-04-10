import { createFileRoute } from "@tanstack/react-router";
import { getCurrentUserFn } from "#/lib/auth";
import { getWorkspaces } from "#/lib/workspaces";

export const Route = createFileRoute("/")({
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
  loader: async () => ({
    user: await getCurrentUserFn(),
    workspaces: await getWorkspaces(),
  }),
  component: App,
});

function App() {
  const { user, workspaces } = Route.useLoaderData();

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
        {workspaces.map((workspace) => (
          <a
            className="relative flex w-full cursor-pointer items-center justify-start rounded-full border-2 border-neutral-200 px-6 py-3 text-center transition-colors duration-200 hover:bg-neutral-100"
            href={`/workspaces/${workspace.id}`}
            key={workspace.id}
          >
            {workspace.name}
          </a>
        ))}
      </section>
    </>
  );
}
