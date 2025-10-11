import { component$ } from "@builder.io/qwik";
import { Link, type RequestHandler, routeLoader$ } from "@builder.io/qwik-city";
import { db } from "database";
import { middlewareAuthentication } from "~/lib/auth";

export const onRequest: RequestHandler = async ({
  next,
  cookie,
  redirect,
  sharedMap,
}) => {
  const sessionToken = cookie.get("selfmail-session-token")?.value;

  if (!sessionToken) {
    throw redirect(302, "/auth/login");
  }

  const { authenticated, user } = await middlewareAuthentication(sessionToken);

  if (!authenticated || !user) {
    throw redirect(302, "/auth/login");
  }

  const workspaces = await db.workspace.findMany({
    where: {
      Member: {
        every: {
          userId: user.id,
        }
      }
    }
  })

  sharedMap.set("workspaces", workspaces);

  await next();
};

const useWorkspaces = routeLoader$(async ({ sharedMap }) => {
  return sharedMap.get("workspaces") as {
    id: string;
    name: string;
    slug: string;
    image: string;
  }[];
});

export default component$(() => {
  const workspaces = useWorkspaces();

  return (
    <div class="flex min-h-screen w-full flex-col items-center justify-center space-y-3 bg-neutral-50">
      <h1 class="font-medium text-lg">Pick your Workspace</h1>
      <div class="flex w-full flex-col gap-6 rounded-lg border border-neutral-200 bg-white px-5 py-5 lg:max-w-md">
        {(workspaces.value.length === 0 && (
          <p class="text-center text-neutral-500 text-sm">
            You have no workspaces. Create one!
          </p>
        ))}
        {
          workspaces.value.map(
            (workspace) => (
              <Link
                href={`/workspace/${workspace.slug}`}
                class="flex items-center space-x-3 rounded-lg border border-neutral-200 p-3 hover:bg-neutral-100"
                key={workspace.id}
              >
                {workspace.image ? (
                  <img
                    src={workspace.image}
                    alt={workspace.name}
                    class="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div class="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200">
                    <span class="font-medium text-neutral-600 text-sm">
                      {workspace.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  </div>
                )}
                <span class="font-medium">{workspace.name}</span>
              </Link>
            ),
          )}
      </div>
      <Link href="/create" class="text-neutral-500 text-sm hover:underline">
        Create a new Workspace
      </Link>
    </div>
  );
});
