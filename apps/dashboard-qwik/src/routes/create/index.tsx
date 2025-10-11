import { component$, useVisibleTask$ } from "@builder.io/qwik";
import {
    Form,
    type RequestHandler,
    routeAction$,
    useNavigate,
    z,
    zod$,
} from "@builder.io/qwik-city";
import { db } from "database";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { middlewareAuthentication } from "~/lib/auth";

export const onRequest: RequestHandler = async ({
    next,
    cookie,
    redirect,
    sharedMap,
}) => {
    const sessionToken = cookie.get("selfmail-session-token")?.value;

    const { authenticated, user } = await middlewareAuthentication(sessionToken);

    if (!authenticated || !user) {
        throw redirect(302, "/auth/login");
    }

    sharedMap.set("user", user);

    await next();
};

export const useCreateWorkspace = routeAction$(
    async ({ workspace: { name, slug } }, { sharedMap, error, env }) => {
        if (!sharedMap.has("user") || !sharedMap.get("user").id) {
            throw error(401, "Unauthorized");
        }

        // check whether a workspace with the same slug already exists
        const existingWorkspace = await db.workspace.findUnique({
            where: {
                slug,
            },
        });

        if (existingWorkspace) {
            return {
                fieldErrors: {
                    slug: "A workspace with this slug already exists",
                },
                failed: true,
            };
        }

        // create new workspace
        const workspace = await db.workspace.create({
            data: {
                name,
                planId: env.get("DEFAULT_WORKSPACE_PLAN_ID") || "free",
                slug,
                ownerId: sharedMap.get("user").id,
            },
        });

        if (!workspace) {
            return {
                fieldErrors: {
                    workspace: "Failed to create workspace",
                },
                failed: true,
            };
        }

        const member = await db.member.create({
            data: {
                userId: sharedMap.get("user").id,
                workspaceId: workspace.id,
            },
        });

        if (!member) {
            return {
                fieldErrors: {
                    workspace: "Failed to create workspace member",
                },
                failed: true,
            };
        }

        return {
            fieldErrors: {},
            failed: false,
            success: true,
            workspaceId: workspace.id,
        };
    },
    zod$({
        workspace: z.object({
            name: z
                .string()
                .min(3, "Name must be at least 3 characters")
                .max(50, "Name must be at most 50 characters"),
            slug: z
                .string()
                .min(3, "Slug must be at least 3 characters")
                .max(50, "Slug must be at most 50 characters")
                .regex(
                    /^[a-zA-Z0-9-]+$/,
                    "Slug can only contain letters, numbers, and hyphens",
                ),
        }),
    }),
);

export default component$(() => {
    const create = useCreateWorkspace();
    const navigate = useNavigate();

    useVisibleTask$(({ track }) => {
        track(() => create.value);

        if (create.value?.success) {
            // Redirect to the new workspace
            navigate(`/workspace/${create.value.workspaceId}`);
        }
    });

    return (
        <div class="flex min-h-screen w-full items-center justify-center bg-neutral-50">
            <Form action={create} class="flex w-full max-w-md flex-col gap-4">
                <h1 class="font-bold text-2xl">Create a new Workspace</h1>
                <Input name="workspace.name" placeholder="Workspace Name" required />
                <Input name="workspace.slug" placeholder="Workspace Slug" required />
                <Button>{create.isRunning ? "Creating..." : "Create Workspace"}</Button>
            </Form>
        </div>
    );
});
