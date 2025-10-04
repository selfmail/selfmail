import { component$ } from "@builder.io/qwik";

export default component$<{
    value: {
        user: {
            username: string;
            email: string;
        };
        userWorkspaces: ({
            id: string;
            name: string;
            slug: string;
            image: string | null;
        } | null)[];
        currentWorkspace: {
            id: string;
            name: string;
        };
    }
}>(({ value: { currentWorkspace } }) => {
    return <header class="flex w-full items-center justify-between">
        <div class="flex flex-row items-center space-x-3">
            <p>{currentWorkspace.name}</p>
        </div>
    </header>
});