import { promises as dns } from "node:dns";
import { $, component$, useSignal } from "@builder.io/qwik";
import { Link, routeLoader$, server$ } from "@builder.io/qwik-city";
import {
    LuCheck,
    LuLoader2,
    LuPlus,
    LuTrash2,
    LuX,
} from "@qwikest/icons/lucide";
import { db } from "database";
import { AlertDialog, ConfirmDialog } from "~/components/ui/AlertDialog";
import type { WorkspaceInSharedMap } from "../types";

const useDomains = routeLoader$(async ({ sharedMap }) => {
    const workspace = sharedMap.get("workspace") as WorkspaceInSharedMap;

    const domains = await db.domain.findMany({
        where: {
            workspaceId: workspace.id,
        },
        include: {
            _count: {
                select: {
                    addresses: true,
                },
            },
        },
    });

    return domains;
});

// DNS check function for domains
const checkDomainDNS = server$(async (domainId: string) => {
    try {
        const domain = await db.domain.findUnique({
            where: {
                id: domainId,
            },
        });

        if (!domain) {
            return {
                success: false,
                error: "Domain not found",
            };
        }

        const result = {
            mxCheck: { pass: false },
            txtVerificationCheck: { pass: false },
            spfCheck: { pass: false },
            dkimCheck: { pass: false },
            allChecksPass: false,
        };

        // Check MX records
        try {
            const mxRecords = await dns.resolveMx(domain.domain);
            result.mxCheck.pass = mxRecords.some(
                (record) => record.exchange.toLowerCase() === "mail.selfmail.app",
            );
        } catch {
            result.mxCheck.pass = false;
        }

        // Check TXT records for verification token and SPF
        try {
            const txtRecords = await dns.resolveTxt(domain.domain);

            // Check verification token
            result.txtVerificationCheck.pass = txtRecords.some((record) =>
                record.join(" ").includes(domain.verificationToken),
            );

            // Check SPF records
            const spfRecords = txtRecords.filter((record) =>
                record.join(" ").toLowerCase().startsWith("v=spf1"),
            );
            result.spfCheck.pass = spfRecords.length > 0;
        } catch {
            result.txtVerificationCheck.pass = false;
            result.spfCheck.pass = false;
        }

        // Check DKIM records
        try {
            const dkimSelector = "default";
            const dkimDomain = `${dkimSelector}._domainkey.${domain.domain}`;
            const dkimRecords = await dns.resolveTxt(dkimDomain);

            result.dkimCheck.pass = dkimRecords.some((record) =>
                record.join(" ").toLowerCase().includes("v=dkim1"),
            );
        } catch {
            result.dkimCheck.pass = false;
        }

        result.allChecksPass =
            result.mxCheck.pass &&
            result.txtVerificationCheck.pass &&
            result.spfCheck.pass &&
            result.dkimCheck.pass;

        return {
            success: true,
            ...result,
        };
    } catch (error) {
        return {
            success: false,
            error: (error as Error).message,
        };
    }
});

// Delete domain function
const deleteDomain = server$(async (domainId: string) => {
    try {
        // Check if domain has addresses
        const addressCount = await db.address.count({
            where: {
                Domain: {
                    id: domainId,
                },
            },
        });

        if (addressCount > 0) {
            return {
                success: false,
                error: `Cannot delete domain. It has ${addressCount} addresses associated with it.`,
            };
        }

        await db.domain.delete({
            where: {
                id: domainId,
            },
        });

        return {
            success: true,
        };
    } catch (error) {
        return {
            success: false,
            error: (error as Error).message,
        };
    }
});

type DomainStatus = {
    mxCheck: { pass: boolean };
    txtVerificationCheck: { pass: boolean };
    spfCheck: { pass: boolean };
    dkimCheck: { pass: boolean };
    allChecksPass: boolean;
};

export default component$(() => {
    const domains = useDomains();
    const domainStatuses = useSignal<Record<string, DomainStatus>>({});
    const loadingStatuses = useSignal<Record<string, boolean>>({});
    const deletingDomains = useSignal<Record<string, boolean>>({});

    // Dialog states
    const showDeleteConfirm = useSignal(false);
    const showErrorAlert = useSignal(false);
    const deleteDialogData = useSignal<{ id: string; name: string } | null>(null);
    const errorMessage = useSignal("");

    const checkDomainStatus = $(async (domainId: string) => {
        loadingStatuses.value = { ...loadingStatuses.value, [domainId]: true };

        const result = await checkDomainDNS(domainId);

        if (result.success && "allChecksPass" in result) {
            domainStatuses.value = {
                ...domainStatuses.value,
                [domainId]: {
                    mxCheck: result.mxCheck,
                    txtVerificationCheck: result.txtVerificationCheck,
                    spfCheck: result.spfCheck,
                    dkimCheck: result.dkimCheck,
                    allChecksPass: result.allChecksPass,
                },
            };
        }

        loadingStatuses.value = { ...loadingStatuses.value, [domainId]: false };
    });

    const handleDeleteDomain = $(async (domainId: string, domainName: string) => {
        deleteDialogData.value = { id: domainId, name: domainName };
        showDeleteConfirm.value = true;
    });

    const confirmDeleteDomain = $(async () => {
        if (!deleteDialogData.value) return;

        const { id: domainId } = deleteDialogData.value;
        deletingDomains.value = { ...deletingDomains.value, [domainId]: true };

        const result = await deleteDomain(domainId);

        if (result.success) {
            // Refresh the page to update the domains list
            window.location.reload();
        } else {
            errorMessage.value = `Failed to delete domain: ${result.error}`;
            showErrorAlert.value = true;
            deletingDomains.value = { ...deletingDomains.value, [domainId]: false };
        }
    });

    // Dialog close handlers as QRLs
    const handleCloseDeleteConfirm = $(() => {
        showDeleteConfirm.value = false;
    });

    const handleCloseErrorAlert = $(() => {
        showErrorAlert.value = false;
    });

    const getOverallStatus = (domain: { verified: boolean; id: string }) => {
        if (!domain.verified) {
            return {
                status: "unverified",
                color: "text-orange-600",
                bg: "bg-orange-50 border-orange-200",
            };
        }

        const domainStatus = domainStatuses.value[domain.id];
        if (!domainStatus) {
            return {
                status: "unknown",
                color: "text-gray-600",
                bg: "bg-gray-50 border-gray-200",
            };
        }

        if (domainStatus.allChecksPass) {
            return {
                status: "fully configured",
                color: "text-green-600",
                bg: "bg-green-50 border-green-200",
            };
        }

        return {
            status: "partially configured",
            color: "text-yellow-600",
            bg: "bg-yellow-50 border-yellow-200",
        };
    };

    const getStatusIcon = (passed?: boolean, isLoading?: boolean) => {
        if (isLoading)
            return <LuLoader2 class="h-3 w-3 animate-spin text-blue-500" />;
        if (passed === undefined)
            return <div class="h-3 w-3 rounded-full bg-gray-300" />;
        return passed ? (
            <LuCheck class="h-3 w-3 text-green-500" />
        ) : (
            <LuX class="h-3 w-3 text-red-500" />
        );
    };

    return (
        <div class="min-h-screen bg-neutral-50 p-6">
            <div class="mx-auto max-w-6xl">
                <div class="mb-6 flex items-center justify-between">
                    <div>
                        <h1 class="font-semibold text-2xl text-gray-900">Domains</h1>
                        <p class="text-gray-600">
                            Manage your email domains and their configuration
                        </p>
                    </div>
                    <Link
                        href="new"
                        class="inline-flex items-center gap-2 rounded-lg bg-neutral-800 px-4 py-2 text-white transition-colors hover:bg-neutral-700"
                    >
                        <LuPlus class="h-4 w-4" />
                        Add Domain
                    </Link>
                </div>

                {domains.value.length === 0 ? (
                    <div class="rounded-lg border border-gray-200 bg-white p-8 text-center">
                        <p class="text-gray-500">
                            No domains found. Add your first domain to get started.
                        </p>
                    </div>
                ) : (
                    <div class="grid gap-4">
                        {domains.value.map((domain) => {
                            const status = getOverallStatus(domain);
                            const domainStatus = domainStatuses.value[domain.id];
                            const isLoading = loadingStatuses.value[domain.id];
                            const isDeleting = deletingDomains.value[domain.id];

                            return (
                                <div
                                    key={domain.id}
                                    class={`rounded-lg border p-6 ${status.bg}`}
                                >
                                    <div class="flex items-start justify-between">
                                        <div class="flex-1">
                                            <div class="flex items-center gap-3">
                                                <h3 class="font-medium text-gray-900 text-lg">
                                                    {domain.domain}
                                                </h3>
                                                <span
                                                    class={`rounded-full px-2 py-1 font-medium text-xs ${status.color} bg-opacity-75`}
                                                >
                                                    {status.status}
                                                </span>
                                            </div>

                                            <div class="mt-2 flex items-center gap-4 text-gray-600 text-sm">
                                                <span>{domain._count.addresses} addresses</span>
                                                {domain.verified ? (
                                                    <span class="text-green-600">✓ Verified</span>
                                                ) : (
                                                    <Link
                                                        href={`verify?domain=${domain.domain}`}
                                                        class="text-blue-600 hover:text-blue-800"
                                                    >
                                                        → Verify Domain
                                                    </Link>
                                                )}
                                            </div>

                                            {domain.verified && domainStatus && (
                                                <div class="mt-4">
                                                    <h4 class="mb-2 font-medium text-gray-700 text-sm">
                                                        DNS Configuration Status:
                                                    </h4>
                                                    <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                                        <div class="flex items-center gap-2">
                                                            {getStatusIcon(
                                                                domainStatus.mxCheck.pass,
                                                                isLoading,
                                                            )}
                                                            <span class="text-gray-600 text-xs">
                                                                MX Record
                                                            </span>
                                                        </div>
                                                        <div class="flex items-center gap-2">
                                                            {getStatusIcon(
                                                                domainStatus.txtVerificationCheck.pass,
                                                                isLoading,
                                                            )}
                                                            <span class="text-gray-600 text-xs">
                                                                TXT Verification
                                                            </span>
                                                        </div>
                                                        <div class="flex items-center gap-2">
                                                            {getStatusIcon(
                                                                domainStatus.spfCheck.pass,
                                                                isLoading,
                                                            )}
                                                            <span class="text-gray-600 text-xs">
                                                                SPF Record
                                                            </span>
                                                        </div>
                                                        <div class="flex items-center gap-2">
                                                            {getStatusIcon(
                                                                domainStatus.dkimCheck.pass,
                                                                isLoading,
                                                            )}
                                                            <span class="text-gray-600 text-xs">
                                                                DKIM Record
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div class="flex items-center gap-2">
                                            {domain.verified && (
                                                <button
                                                    type="button"
                                                    onClick$={() => checkDomainStatus(domain.id)}
                                                    disabled={isLoading}
                                                    class="rounded-lg border border-gray-300 bg-white px-3 py-2 font-medium text-gray-700 text-sm hover:bg-gray-50 disabled:opacity-50"
                                                >
                                                    {isLoading ? "Checking..." : "Check Status"}
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                onClick$={() =>
                                                    handleDeleteDomain(domain.id, domain.domain)
                                                }
                                                disabled={isDeleting}
                                                class="rounded-lg border border-red-300 bg-white px-3 py-2 font-medium text-red-700 text-sm hover:bg-red-50 disabled:opacity-50"
                                            >
                                                {isDeleting ? (
                                                    <LuLoader2 class="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <LuTrash2 class="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteConfirm.value}
                onClose={handleCloseDeleteConfirm}
                onConfirm={confirmDeleteDomain}
                title="Delete Domain"
                confirmText="Delete"
                cancelText="Cancel"
                variant="error"
            >
                Are you sure you want to delete domain "{deleteDialogData.value?.name}"?
                This action cannot be undone.
            </ConfirmDialog>

            {/* Error Alert Dialog */}
            <AlertDialog
                isOpen={showErrorAlert.value}
                onClose={handleCloseErrorAlert}
                title="Error"
                variant="error"
            >
                {errorMessage.value}
            </AlertDialog>
        </div>
    );
});
