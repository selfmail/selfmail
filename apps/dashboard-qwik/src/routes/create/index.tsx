import { component$ } from "@builder.io/qwik";
import { Form, type RequestHandler, routeAction$, z, zod$ } from "@builder.io/qwik-city";
import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import { middlewareAuthentication } from "~/lib/auth";

export const onRequest: RequestHandler = async ({ next, cookie, redirect }) => {
    const sessionToken = cookie.get("selfmail-session-token")?.value;

    const { authenticated } = await middlewareAuthentication(sessionToken);

    if (!authenticated) {
        throw redirect(302, "/auth/login");
    }

    await next();
};

export const useCreateWorkspace = routeAction$(
    async ({ workspace: { name, slug } }) => {

        return {
            fieldErrors: {},
            failed: false
        }
    },
    zod$({
        workspace: z.object({
            name: z.string().min(3, "Name must be at least 3 characters").max(50, "Name must be at most 50 characters"),
            slug: z.string().min(3, "Slug must be at least 3 characters").max(50, "Slug must be at most 50 characters").regex(/^[a-zA-Z0-9-]+$/, "Slug can only contain letters, numbers, and hyphens"),
        }),
    }))

export default component$(() => {
    const create = useCreateWorkspace();
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
