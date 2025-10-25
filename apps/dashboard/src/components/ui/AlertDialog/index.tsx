import { component$, Slot } from "@builder.io/qwik";
import { Modal } from "@qwik-ui/headless";

type AlertDialogProps = {
    proceedAction: () => void | Promise<void>;
    title: string;
    class?: string;
    description: string;
    proceedActionText?: string;
};

export default component$<AlertDialogProps>(
    ({
        class: triggerClass,
        proceedAction,
        description,
        title,
        proceedActionText,
    }) => {
        return (
            <Modal.Root alert>
                <Modal.Trigger class={triggerClass}>
                    <Slot />
                </Modal.Trigger>

                <Modal.Panel class="bg-white rounded-lg border border-neutral-200 p-6  max-w-md transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 fixed">
                    <div class="flex flex-col space-y-2 text-center sm:text-left">
                        <Modal.Title class="font-semibold text-lg text-neutral-900">
                            {title}
                        </Modal.Title>
                        <Modal.Description class="text-neutral-500 text-sm">
                            {description}
                        </Modal.Description>
                    </div>

                    <footer class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                        <Modal.Close autofocus class="mt-2 inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 py-2 font-medium text-neutral-900 text-sm ring-offset-white transition-colors hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:mt-0">
                            Cancel
                        </Modal.Close>
                        <Modal.Close
                            onClick$={proceedAction}
                            class="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg bg-red-600 px-4 py-2 font-medium text-sm text-white ring-offset-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                        >
                            {proceedActionText || "Proceed"}
                        </Modal.Close>
                    </footer>
                </Modal.Panel>
            </Modal.Root>
        );
    },
);
