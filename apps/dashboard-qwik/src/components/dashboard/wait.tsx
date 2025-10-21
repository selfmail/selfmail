import { component$ } from "@builder.io/qwik";

export default component$<{ description?: string }>(
    ({
        description = "This page is currently in process. We are working hard to provide it as soon as possible!",
    }) => {
        return (
            <div class="flex h-full items-center justify-center">
                <div class="flex max-w-md flex-col space-y-3">
                    <h2 class="font-medium text-lg">Coming soon to Selfmail!</h2>
                    <p class="text-neutral-500">{description}</p>
                </div>
            </div>
        );
    },
);
