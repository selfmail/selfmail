import { component$, useStore, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import {
  Form,
  type RequestHandler,
  routeAction$,
  useNavigate,
  z,
  zod$,
} from "@builder.io/qwik-city";
import { init } from "@paralleldrive/cuid2";
import { db, type Workspace } from "database";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { middlewareAuthentication } from "~/lib/auth";

const createId = init({
  length: 8,
});

export const onRequest: RequestHandler = async ({
  next,
  cookie,
  redirect,
  sharedMap,
}) => {
  const sessionToken = cookie.get("selfmail-session-token")?.value;

  const { authenticated, user } = await middlewareAuthentication(sessionToken);

  if (!(authenticated && user)) {
    throw redirect(302, "/auth/login");
  }

  sharedMap.set("user", user);

  await next();
};

export const useCreateWorkspace = routeAction$(
  async ({ workspace: { name } }, { sharedMap, error }) => {
    if (!(sharedMap.has("user") && sharedMap.get("user").id)) {
      throw error(401, "Unauthorized");
    }

    const slug = createId();
    let workspace: Workspace;

    try {
      workspace = await db.workspace.create({
        data: {
          name,
          slug,
          ownerId: sharedMap.get("user").id,
        },
      });
    } catch (_) {
      return {
        fieldErrors: {
          name: "Failed to create workspace. Contact support if the issue persists.",
        },
        failed: true,
      };
    }

    if (!workspace) {
      return {
        fieldErrors: {
          name: "Failed to create workspace",
        },
        failed: true,
      };
    }

    const member = await db.member.create({
      data: {
        userId: sharedMap.get("user").id,
        workspaceId: workspace.id,
        profileName: sharedMap.get("user").name || "Owner",
      },
    });

    if (!member) {
      return {
        fieldErrors: {
          workspace: {
            name: "Failed to add member to workspace",
          },
        },
        failed: true,
      };
    }

    return {
      fieldErrors: {},
      failed: false,
      success: true,
    };
  },
  zod$({
    workspace: z.object({
      name: z
        .string()
        .min(3, "Name must be at least 3 characters")
        .max(50, "Name must be at most 50 characters"),
    }),
  })
);

export default component$(() => {
  const create = useCreateWorkspace();
  const navigate = useNavigate();
  const fieldErrors = useStore({
    name: "",
  });

  useVisibleTask$(({ track }) => {
    track(() => create.value);
    if (create.value?.failed) {
      const errors = create.value.fieldErrors as Record<string, string>;
      fieldErrors.name = errors.name || "";

      return;
    }
    if (create.value?.success) {
      navigate("/");
    }
  });

  return (
    <div class="flex min-h-screen w-full items-center justify-center bg-neutral-50">
      <Form action={create} class="flex w-full max-w-md flex-col gap-4">
        <h1 class="font-bold text-2xl">Create a new Workspace</h1>
        <Input name="workspace.name" placeholder="Workspace Name" required />
        {fieldErrors.name && <p class="text-red-700">{fieldErrors.name}</p>}
        <Button>{create.isRunning ? "Creating..." : "Create Workspace"}</Button>
      </Form>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Create Workspace | Selfmail",
  meta: [
    {
      name: "description",
      content:
        "Create a new workspace to organize your emails and team collaboration on Selfmail.",
    },
    {
      property: "og:title",
      content: "Create Workspace | Selfmail",
    },
    {
      property: "og:description",
      content:
        "Create a new workspace to organize your emails and team collaboration on Selfmail.",
    },
    {
      property: "og:type",
      content: "website",
    },
    {
      name: "robots",
      content: "noindex, nofollow",
    },
  ],
  links: [
    {
      rel: "canonical",
      href: "https://app.selfmail.com/create",
    },
  ],
};
