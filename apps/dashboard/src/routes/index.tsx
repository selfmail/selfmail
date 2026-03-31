import { createFileRoute } from "@tanstack/react-router";
import { getCurrentUserFn } from "#/lib/auth";

export const Route = createFileRoute("/")({
  loader: async () => ({
    user: await getCurrentUserFn(),
  }),
  component: HomePage,
});

function HomePage() {
  const { user } = Route.useLoaderData();

  return (
    <div>
      <h1 className="font-bold text-3xl">Welcome, {user.name}!</h1>
    </div>
  );
}
