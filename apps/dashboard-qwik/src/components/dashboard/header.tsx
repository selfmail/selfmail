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
            image: string | null;
        };
    };
}>(({ value: { currentWorkspace } }) => {
    return (
        <header class="flex w-full items-center justify-between">
            <div class="flex cursor-pointer flex-row items-center space-x-3 rounded-lg pr-1 transition hover:bg-neutral-200 hover:ring-4 hover:ring-neutral-200">
                {currentWorkspace.image ? (
                    <img
                        src={currentWorkspace.image}
                        alt={currentWorkspace.name}
                        class="h-7 w-7 rounded-lg object-cover"
                    />
                ) : (
                    <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-600 font-medium text-lg text-white">
                        {currentWorkspace.name.charAt(0).toUpperCase()}
                    </div>
                )}
                <h3 class="font-medium text-lg">{currentWorkspace.name}</h3>
            </div>
        </header>
    );
});
