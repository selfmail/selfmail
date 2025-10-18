import {
    component$,
    type QRL,
    Slot,
    useSignal,
    useTask$,
} from "@builder.io/qwik";
import { Modal } from "@qwik-ui/headless";
import {
    LuAlertTriangle,
    LuCheckCircle,
    LuInfo,
    LuX,
    LuXCircle,
} from "@qwikest/icons/lucide";

interface AlertDialogProps {
    isOpen: boolean;
    onClose: QRL<() => void>;
    title?: string;
    variant?: "info" | "warning" | "error" | "success";
}

export const AlertDialog = component$<AlertDialogProps>(
    ({ isOpen, onClose, title = "Alert", variant = "info" }) => {
        const showModal = useSignal(isOpen);

        useTask$(({ track }) => {
            track(() => isOpen);
            showModal.value = isOpen;
        });

        const getVariantStyles = () => {
            switch (variant) {
                case "error":
                    return {
                        icon: <LuXCircle class="h-5 w-5 text-red-600" />,
                        titleColor: "text-red-800",
                        bg: "bg-red-50",
                        border: "border-red-200",
                    };
                case "warning":
                    return {
                        icon: <LuAlertTriangle class="h-5 w-5 text-yellow-600" />,
                        titleColor: "text-yellow-800",
                        bg: "bg-yellow-50",
                        border: "border-yellow-200",
                    };
                case "success":
                    return {
                        icon: <LuCheckCircle class="h-5 w-5 text-green-600" />,
                        titleColor: "text-green-800",
                        bg: "bg-green-50",
                        border: "border-green-200",
                    };
                default:
                    return {
                        icon: <LuInfo class="h-5 w-5 text-blue-600" />,
                        titleColor: "text-blue-800",
                        bg: "bg-blue-50",
                        border: "border-blue-200",
                    };
            }
        };

        const styles = getVariantStyles();

        return (
            <Modal.Root bind:show={showModal}>
                <Modal.Panel class="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        class="absolute inset-0 bg-black bg-opacity-50"
                        onClick$={onClose}
                    />

                    {/* Dialog */}
                    <div
                        class={`relative mx-4 max-w-md rounded-lg border p-6 shadow-lg ${styles.bg} ${styles.border}`}
                    >
                        {/* Header */}
                        <div class="mb-4 flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <span class="text-lg">{styles.icon}</span>
                                <h2 class={`font-medium text-lg ${styles.titleColor}`}>
                                    {title}
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick$={onClose}
                                class="rounded-lg p-1 hover:bg-black hover:bg-opacity-10"
                            >
                                <LuX class="h-4 w-4" />
                            </button>
                        </div>

                        {/* Content */}
                        <div class="text-gray-700 text-sm">
                            <Slot />
                        </div>

                        {/* Footer */}
                        <div class="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick$={onClose}
                                class="rounded-lg bg-gray-800 px-4 py-2 text-white hover:bg-gray-700"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </Modal.Panel>
            </Modal.Root>
        );
    },
);

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: QRL<() => void>;
    onConfirm: QRL<() => void>;
    title?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "warning" | "error";
}

export const ConfirmDialog = component$<ConfirmDialogProps>(
    ({
        isOpen,
        onClose,
        onConfirm,
        title = "Confirm Action",
        confirmText = "Confirm",
        cancelText = "Cancel",
        variant = "warning",
    }) => {
        const showModal = useSignal(isOpen);

        useTask$(({ track }) => {
            track(() => isOpen);
            showModal.value = isOpen;
        });

        const getVariantStyles = () => {
            switch (variant) {
                case "error":
                    return {
                        icon: "❌",
                        titleColor: "text-red-800",
                        bg: "bg-red-50",
                        border: "border-red-200",
                        confirmButton: "bg-red-600 hover:bg-red-700",
                    };
                default:
                    return {
                        icon: "⚠️",
                        titleColor: "text-yellow-800",
                        bg: "bg-yellow-50",
                        border: "border-yellow-200",
                        confirmButton: "bg-yellow-600 hover:bg-yellow-700",
                    };
            }
        };

        const styles = getVariantStyles();

        return (
            <Modal.Root bind:show={showModal}>
                <Modal.Panel class="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        class="absolute inset-0 bg-black bg-opacity-50"
                        onClick$={onClose}
                    />

                    {/* Dialog */}
                    <div
                        class={`relative mx-4 max-w-md rounded-lg border p-6 shadow-lg ${styles.bg} ${styles.border}`}
                    >
                        {/* Header */}
                        <div class="mb-4 flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <span class="text-lg">{styles.icon}</span>
                                <h2 class={`font-medium text-lg ${styles.titleColor}`}>
                                    {title}
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick$={onClose}
                                class="rounded-lg p-1 hover:bg-black hover:bg-opacity-10"
                            >
                                <LuX class="h-4 w-4" />
                            </button>
                        </div>

                        {/* Content */}
                        <div class="mb-6 text-gray-700 text-sm">
                            <Slot />
                        </div>

                        {/* Footer */}
                        <div class="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick$={onClose}
                                class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                            >
                                {cancelText}
                            </button>
                            <button
                                type="button"
                                onClick$={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                class={`rounded-lg px-4 py-2 text-white ${styles.confirmButton}`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </Modal.Panel>
            </Modal.Root>
        );
    },
);
