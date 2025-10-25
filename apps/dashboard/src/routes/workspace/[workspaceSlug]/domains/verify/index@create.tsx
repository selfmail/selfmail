import { promises as dns } from "node:dns";
import { $, component$, useSignal } from "@builder.io/qwik";
import { routeLoader$, server$, useLocation, useNavigate } from "@builder.io/qwik-city";
import { LuCheck, LuLoader2, LuX } from "@qwikest/icons/lucide";
import { db } from "database";

const useDomainData = routeLoader$(async ({ query, error, sharedMap }) => {
    const domainQuery = query.get("domain");

    if (!domainQuery || typeof domainQuery !== "string") {
        throw error(404, "Domain not found.");
    }

    const workspace = sharedMap.get("workspace");
    if (!workspace || !workspace.id) {
        throw error(400, "Workspace not found in shared map");
    }

    const domain = await db.domain.findUnique({
        where: {
            verified: false,
            domain: domainQuery,
            workspaceId: workspace.id,
        },
    });

    if (!domain) {
        throw error(404, "Domain not found.");
    }

    return domain;
});

// check for the right dns records
const checkDomain = server$(async (domainId: string) => {
    try {
        // Get domain from database
        const domain = await db.domain.findUnique({
            where: {
                id: domainId,
            },
            include: {
                workspace: true,
            },
        });

        if (!domain) {
            return {
                success: false,
                error: "Domain not found",
            };
        }

        // Initialize result object
        const result = {
            mxCheck: { pass: false, records: [] as string[], error: "" },
            txtVerificationCheck: {
                pass: false,
                records: [] as string[],
                error: "",
            },
            spfCheck: { pass: false, records: [] as string[], error: "" },
            dkimCheck: { pass: false, records: [] as string[], error: "" },
            allChecksPass: false,
        };

        // Check MX records
        try {
            const mxRecords = await dns.resolveMx(domain.domain);
            result.mxCheck.records = mxRecords.map(
                (record) => `${record.exchange} (priority: ${record.priority})`,
            );

            // Check if any MX record points to mail.selfmail.app
            result.mxCheck.pass = mxRecords.some(
                (record) => record.exchange.toLowerCase() === "mail.selfmail.app",
            );
        } catch (error) {
            result.mxCheck.error = `Failed to retrieve MX records: ${(error as Error).message}`;
        }

        // Check TXT records for verification token and SPF
        try {
            const txtRecords = await dns.resolveTxt(domain.domain);
            result.txtVerificationCheck.records = txtRecords.map((record) =>
                record.join(" "),
            );

            // Check if verification token exists in TXT records
            result.txtVerificationCheck.pass = txtRecords.some((record) =>
                record.join(" ").includes(domain.verificationToken),
            );

            // Filter only SPF records
            const spfRecords = txtRecords.filter((record) =>
                record.join(" ").toLowerCase().startsWith("v=spf1"),
            );
            result.spfCheck.records = spfRecords.map((record) => record.join(" "));

            // Check if any SPF record exists
            result.spfCheck.pass = spfRecords.length > 0;
        } catch (error) {
            const errorMessage = `Failed to retrieve TXT records: ${(error as Error).message}`;
            result.txtVerificationCheck.error = errorMessage;
            result.spfCheck.error = errorMessage;
        }

        // Check DKIM records
        try {
            // Check for default DKIM selector (most common)
            const dkimSelector = "default";
            const dkimDomain = `${dkimSelector}._domainkey.${domain.domain}`;

            const dkimRecords = await dns.resolveTxt(dkimDomain);
            result.dkimCheck.records = dkimRecords.map((record) => record.join(" "));

            // Check if any DKIM record exists (should contain "v=DKIM1")
            result.dkimCheck.pass = dkimRecords.some((record) =>
                record.join(" ").toLowerCase().includes("v=dkim1"),
            );
        } catch (error) {
            result.dkimCheck.error = `Failed to retrieve DKIM records: ${(error as Error).message}`;
        }

        // All checks pass if all individual checks pass
        result.allChecksPass =
            result.mxCheck.pass &&
            result.txtVerificationCheck.pass &&
            result.spfCheck.pass &&
            result.dkimCheck.pass;

        // If all checks passed, update the domain as verified
        if (result.allChecksPass && !domain.verified) {
            await db.domain.update({
                where: { id: domainId },
                data: {
                    verified: true,
                    verifiedAt: new Date(),
                },
            });
        }

        return {
            success: true,
            domain: domain.domain,
            verificationToken: domain.verificationToken,
            ...result,
        };
    } catch (error) {
        return {
            success: false,
            error: (error as Error).message,
            mxCheck: { pass: false, records: [], error: "Unexpected error" },
            txtVerificationCheck: {
                pass: false,
                records: [],
                error: "Unexpected error",
            },
            spfCheck: { pass: false, records: [], error: "Unexpected error" },
            dkimCheck: { pass: false, records: [], error: "Unexpected error" },
            allChecksPass: false,
        };
    }
});

type VerificationResult = {
    success: boolean;
    error?: string;
    allChecksPass?: boolean;
    mxCheck?: { pass: boolean; records: string[]; error: string };
    txtVerificationCheck?: { pass: boolean; records: string[]; error: string };
    spfCheck?: { pass: boolean; records: string[]; error: string };
    dkimCheck?: { pass: boolean; records: string[]; error: string };
};

export default component$(() => {
    const domain = useDomainData();
    const verificationResult = useSignal<VerificationResult | null>(null);
    const isVerifying = useSignal(false);
    const navigate = useNavigate()
    const location = useLocation()

    const handleVerify = $(async () => {
        isVerifying.value = true;
        verificationResult.value = null;

        const result = await checkDomain(domain.value.id);
        verificationResult.value = result;
        isVerifying.value = false;

        if (result.success && "allChecksPass" in result && result.allChecksPass) {
            navigate(`/workspace/${location.params.workspaceSlug}/domains`);
        }
    });

    const getStatusIcon = (passed?: boolean, isChecking?: boolean) => {
        if (isChecking)
            return <LuLoader2 class="h-4 w-4 animate-spin text-blue-500" />;
        if (passed === undefined) return null;
        return passed ? (
            <LuCheck class="h-4 w-4 text-green-500" />
        ) : (
            <LuX class="h-4 w-4 text-red-500" />
        );
    };

    return (
        <div class="flex min-h-screen w-full items-center justify-center bg-neutral-50">
            <div class="flex w-full max-w-2xl flex-col gap-4">
                <h1 class="font-medium text-2xl">
                    Verify your domain {domain.value.domain}
                </h1>

                {verificationResult.value?.success &&
                    verificationResult.value.allChecksPass && (
                        <div class="rounded-lg border border-green-200 bg-green-50 p-4">
                            <div class="flex items-center gap-2">
                                <span class="text-lg">✅</span>
                                <p class="font-medium text-green-800">
                                    Domain successfully verified! Redirecting shortly...
                                </p>
                            </div>
                        </div>
                    )}

                <div class="rounded-lg border border-neutral-200 bg-white p-4">
                    <h2 class="mb-3 font-medium text-lg">Required DNS Records</h2>
                    <div class="space-y-4 text-sm">
                        <div class="flex items-start justify-between gap-4">
                            <div class="flex-1">
                                <p class="font-medium text-gray-700">MX Record:</p>
                                <code class="rounded bg-gray-100 p-1 text-xs">
                                    mail.selfmail.app
                                </code>
                            </div>
                            <div class="flex items-center">
                                {getStatusIcon(
                                    verificationResult.value?.mxCheck?.pass,
                                    isVerifying.value,
                                )}
                            </div>
                        </div>

                        <div class="flex items-start justify-between gap-4">
                            <div class="flex-1">
                                <p class="font-medium text-gray-700">TXT Verification:</p>
                                <code class="break-all rounded bg-gray-100 p-1 text-xs">
                                    {domain.value.verificationToken}
                                </code>
                            </div>


                            <div class="flex items-center">
                                {getStatusIcon(
                                    verificationResult.value?.txtVerificationCheck?.pass,
                                    isVerifying.value,
                                )}
                            </div>
                        </div>

                        <div class="flex items-start justify-between gap-4">
                            <div class="flex-1">
                                <p class="font-medium text-gray-700">SPF Record:</p>
                                <code class="rounded bg-gray-100 p-1 text-xs">
                                    v=spf1 include:selfmail.app ~all
                                </code>
                            </div>
                            <div class="flex items-center">
                                {getStatusIcon(
                                    verificationResult.value?.spfCheck?.pass,
                                    isVerifying.value,
                                )}
                            </div>
                        </div>

                        <div class="flex items-start justify-between gap-4">
                            <div class="flex-1">
                                <p class="font-medium text-gray-700">
                                    DKIM Record (default._domainkey):
                                </p>
                                <code class="rounded bg-gray-100 p-1 text-xs">
                                    v=DKIM1; k=rsa; p=[your-public-key]
                                </code>
                            </div>
                            <div class="flex items-center">
                                {getStatusIcon(
                                    verificationResult.value?.dkimCheck?.pass,
                                    isVerifying.value,
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    class="flex rounded-lg bg-gradient-to-r from-neutral-800 to-neutral-700 p-4 text-white transition-colors hover:from-neutral-700 hover:to-neutral-600 disabled:opacity-50"
                    onClick$={handleVerify}
                    disabled={isVerifying.value}
                >
                    <h2 class="font-medium text-lg">
                        {isVerifying.value
                            ? "Checking DNS Records..."
                            : "Verify DNS Records"}
                    </h2>
                </button>

                {verificationResult.value && !verificationResult.value.success && (
                    <div class="rounded-lg border border-red-200 bg-red-50 p-4">
                        <div class="flex items-center gap-2">
                            <span class="text-lg">❌</span>
                            <p class="font-medium text-red-800">
                                Verification failed: {verificationResult.value.error}
                            </p>
                        </div>
                    </div>
                )}

                <p class="text-center text-neutral-500 text-sm">
                    Click the button above to check if all required DNS records are
                    properly configured.
                </p>
            </div>
        </div>
    );
});
