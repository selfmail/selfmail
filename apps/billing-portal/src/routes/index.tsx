import { createFileRoute } from "@tanstack/react-router";
import { getCurrentUserFn } from "#/lib/auth";

export const Route = createFileRoute("/")({
  loader: async () => ({
    user: await getCurrentUserFn(),
  }),
  component: App,
});

function App() {
  const { user } = Route.useLoaderData();

  return (
    <div>
      <h2>Welcome {user.name}</h2>
    </div>
  );
}
