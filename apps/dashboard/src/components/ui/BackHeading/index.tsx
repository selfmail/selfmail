import { component$, Slot, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";
import { LuChevronLeft } from "@qwikest/icons/lucide";

export default component$(() => {
    const canGoBack = useSignal(false);
    useVisibleTask$(() => {
        canGoBack.value = history.length > 1;
    });
    const location = useLocation()
    return (
        <h1 class="flex flex-row items-center space-x-1 font-medium text-2xl">
            {canGoBack.value && (
                <button
                    type="button"
                    onClick$={() => history.back()}
                    class="cursor-pointer border-none bg-none text-neutral-500"
                >
                    <LuChevronLeft />
                </button>
            )}
            {!canGoBack.value && <Link href={`/workspace/${location.params.workspaceSlug}`} class="text-neutral-500">
                <LuChevronLeft />
            </Link>}
            <span><Slot /></span>
        </h1>
    );
});
