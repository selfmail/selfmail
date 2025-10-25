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
import { db, type Workspace } from "database";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { middlewareAuthentication } from "~/lib/auth";
import { pricingConfig } from "../../../../../config/pricing";

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
    async ({ workspace: { name, slug } }, { sharedMap, error }) => {
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
        let workspace: Workspace;

        // create new workspace
        try {
            const planId = pricingConfig.defaultPlan.dbId;
            workspace = await db.workspace.create({
                data: {
                    name,
                    planId,
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
    const fieldErrors = useStore({
        name: "",
        slug: "",
    });

    useVisibleTask$(({ track }) => {
        track(() => create.value);
        if (create.value?.failed) {
            const errors = create.value.fieldErrors as Record<string, string>;
            fieldErrors.name = errors.name || "";
            fieldErrors.slug = errors.slug || "";

            return;
        }
        if (create.value?.success) {
            // Due to a permissions bug (or caching issue) we navigate to the workspace list
            navigate("/");
        }
    });

    return (
        <div class="flex min-h-screen w-full items-center justify-center bg-neutral-50">
            <Form action={create} class="flex w-full max-w-md flex-col gap-4">
                <h1 class="font-bold text-2xl">Create a new Workspace</h1>
                <Input name="workspace.name" placeholder="Workspace Name" required />
                {fieldErrors.name && <p class="text-red-700">{fieldErrors.name}</p>}
                <Input name="workspace.slug" placeholder="Workspace Slug" required />
                {fieldErrors.slug && <p class="text-red-700">{fieldErrors.slug}</p>}
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
