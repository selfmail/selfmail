import { component$, useStore, useTask$ } from "@builder.io/qwik";
import { Link, server$ } from "@builder.io/qwik-city";
import { db } from "database";
import { middlewareAuthentication } from "~/lib/auth";

const getData = server$(async function () {
  const sessionToken = this.cookie.get("selfmail-session-token")?.value;

  if (!sessionToken) {
    throw new Error("No session token provided.");
  }

  const { authenticated, user } = await middlewareAuthentication(sessionToken);

  if (!(authenticated && user)) {
    throw new Error("User is not authenticated. Please log in.");
  }

  const workspaces = await db.workspace.findMany({
    where: {
      Member: {
        some: {
          userId: user.id,
        },
      },
    },
  });

  return {
    user: {
      username: user.name,
      email: user.email,
    },
    userWorkspaces: workspaces.map((w) => ({
      id: w.id,
      slug: w.slug,
      name: w.name,
      image: w.image,
    })),
  };
});

export default component$(() => {
  const workspaces = useStore({
    data: [] as {
      id: string;
      slug: string;
      name: string;
      image: string | null;
    }[],
  });

  useTask$(async () => {
    const data = await getData();
    workspaces.data = data.userWorkspaces;
  });

  return (
    <header class="flex w-full flex-row items-center justify-between">
      <div class="flex items-center gap-4">
        <Link class="text-neutral-700 text-sm hover:underline" href="/">
          ← Back to Workspaces
        </Link>
      </div>
      {workspaces.data.length > 0 && (
        <Link
          class="text-neutral-600 text-sm hover:text-neutral-900"
          href={`/workspace/${workspaces.data[0]?.slug}`}
        >
          Go to Workspace
        </Link>
      )}
    </header>
  );
});
