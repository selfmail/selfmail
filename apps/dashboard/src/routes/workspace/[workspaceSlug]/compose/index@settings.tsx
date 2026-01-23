import { component$, useStore, useVisibleTask$ } from "@builder.io/qwik";
import {
    Form,
    Link,
    routeAction$,
    routeLoader$,
    server$,
    useLocation,
    z,
    zod$,
} from "@builder.io/qwik-city";
import { db } from "database";
import { toast } from "qwik-sonner";
import BackHeading from "~/components/ui/BackHeading";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { RecipientInput } from "~/components/ui/RecipientInput";
import { Textarea } from "~/components/ui/Textarea";
import type { MemberInSharedMap, WorkspaceInSharedMap } from "../types";

const useComposeData = routeLoader$(async ({ sharedMap, error, query }) => {
    const member = sharedMap.get("member") as MemberInSharedMap;
    const workspace = sharedMap.get("workspace") as WorkspaceInSharedMap;

    if (!member || !member.id) {
        throw error(403, "Forbidden");
    }

    if (!workspace || !workspace.id) {
        throw error(404, "Workspace not found");
    }

    // Get user's available email addresses
    const memberAddresses = await db.memberAddress.findMany({
        where: {
            memberId: member.id,
        },
        include: {
            address: {
                select: {
                    id: true,
                    email: true,
                },
            },
        },
    });

    // Get contacts from all addresses the member has access to
    const addressIds = memberAddresses.map((ma) => ma.address.id);
    const contacts = await db.contact.findMany({
        where: {
            addressId: {
                in: addressIds,
            },
            blocked: false,
        },
        select: {
            id: true,
            name: true,
            email: true,
            description: true,
        },
        orderBy: {
            name: "asc",
        },
    });

    // Get all drafts for this member
    const drafts = await db.draft.findMany({
        where: {
            memberId: member.id,
            workspaceId: workspace.id,
        },
        orderBy: {
            updatedAt: "desc",
        },
    });

    // Load specific draft if draftId is provided
    const draftId = query.get("draftId");
    let currentDraft = null;
    if (draftId) {
        currentDraft = await db.draft.findFirst({
            where: {
                id: draftId,
                memberId: member.id,
                workspaceId: workspace.id,
            },
        });
    }

    return {
        addresses: memberAddresses.map((ma) => ({
            id: ma.address.id,
            email: ma.address.email,
        })),
        contacts,
        drafts,
        currentDraft,
    };
});

const sendEmail = server$(async function (emailData: {
    from: string;
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    body: string;
}) {
    const member = this.sharedMap.get("member") as MemberInSharedMap;
    const workspace = this.sharedMap.get("workspace") as WorkspaceInSharedMap;

    if (!member || !workspace) {
        throw new Error("Authentication required");
    }

    // Verify the from address belongs to this member
    const fromAddress = await db.memberAddress.findFirst({
        where: {
            memberId: member.id,
            address: {
                email: emailData.from,
            },
        },
        include: {
            address: true,
        },
    });

    if (!fromAddress) {
        throw new Error("Invalid sender address or access denied");
    }

    // Parse recipients
    const toEmails = emailData.to
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean);
    const ccEmails = emailData.cc
        ? emailData.cc
            .split(",")
            .map((email) => email.trim())
            .filter(Boolean)
        : undefined;
    const bccEmails = emailData.bcc
        ? emailData.bcc
            .split(",")
            .map((email) => email.trim())
            .filter(Boolean)
        : undefined;

    // Make API call to send email (using the workspace service)
    const response = await fetch(
        `${process.env.API_URL || "http://localhost:3001"}/v1/web/workspace/${workspace.id}/send-email`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.cookie.get("selfmail-session-token")?.value}`,
            },
            body: JSON.stringify({
                from: emailData.from,
                to: toEmails,
                cc: ccEmails,
                bcc: bccEmails,
                subject: emailData.subject,
                text: emailData.body,
                workspaceId: workspace.id,
            }),
        },
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to send email");
    }

    return await response.json();
});

export const useSaveDraft = routeAction$(
    async ({ draftId, title, from, to, cc, bcc, subject, body }, { sharedMap, error }) => {
        const member = sharedMap.get("member") as MemberInSharedMap;
        const workspace = sharedMap.get("workspace") as WorkspaceInSharedMap;

        if (!member || !member.id) {
            throw error(403, "Forbidden");
        }

        if (!workspace || !workspace.id) {
            throw error(404, "Workspace not found");
        }

        try {
            const draftData = {
                title: title || subject || "Untitled Draft",
                from,
                to: to || null,
                cc: cc || null,
                bcc: bcc || null,
                subject: subject || null,
                body: body || null,
                memberId: member.id,
                workspaceId: workspace.id,
            };

            let draft;
            if (draftId) {
                draft = await db.draft.update({
                    where: {
                        id: draftId,
                        memberId: member.id,
                    },
                    data: draftData,
                });
            } else {
                draft = await db.draft.create({
                    data: draftData,
                });
            }

            return {
                fieldErrors: {},
                failed: false,
                success: true,
                draftId: draft.id,
            };
        } catch (e) {
            return {
                fieldErrors: {
                    general:
                        e instanceof Error
                            ? e.message
                            : "Failed to save draft. Please try again.",
                },
                failed: true,
            };
        }
    },
    zod$({
        draftId: z.string().optional(),
        title: z.string().optional(),
        from: z.string().email("Please select a valid sender address"),
        to: z.string().optional(),
        cc: z.string().optional(),
        bcc: z.string().optional(),
        subject: z.string().optional(),
        body: z.string().optional(),
    }),
);

export const useDeleteDraft = routeAction$(
    async ({ draftId }, { sharedMap, error }) => {
        const member = sharedMap.get("member") as MemberInSharedMap;

        if (!member || !member.id) {
            throw error(403, "Forbidden");
        }

        try {
            await db.draft.delete({
                where: {
                    id: draftId,
                    memberId: member.id,
                },
            });

            return {
                failed: false,
                success: true,
            };
        } catch (e) {
            return {
                fieldErrors: {
                    general:
                        e instanceof Error
                            ? e.message
                            : "Failed to delete draft.",
                },
                failed: true,
            };
        }
    },
    zod$({
        draftId: z.string(),
    }),
);

export const useSendEmail = routeAction$(
    async ({ from, to, cc, bcc, subject, body }, { sharedMap, error }) => {
        const member = sharedMap.get("member") as MemberInSharedMap;
        const workspace = sharedMap.get("workspace") as WorkspaceInSharedMap;

        if (!member || !member.id) {
            throw error(403, "Forbidden");
        }

        if (!workspace || !workspace.id) {
            throw error(404, "Workspace not found");
        }

        try {
            await sendEmail({
                from,
                to,
                cc,
                bcc,
                subject,
                body,
            });

            return {
                fieldErrors: {},
                failed: false,
                success: true,
            };
        } catch (e) {
            console.error("Error sending email:", e);
            return {
                fieldErrors: {
                    general:
                        e instanceof Error
                            ? e.message
                            : "Failed to send email. Please try again.",
                },
                failed: true,
            };
        }
    },
    zod$({
        from: z.string().email("Please select a valid sender address"),
        to: z
            .string()
            .min(1, "At least one recipient is required")
            .refine((value) => {
                const emails = value.split(",").map((email) => email.trim());
                return emails.every(
                    (email) => z.string().email().safeParse(email).success,
                );
            }, "Please enter valid email addresses separated by commas"),
        cc: z
            .string()
            .optional()
            .refine((value) => {
                if (!value || value.trim() === "") return true;
                const emails = value.split(",").map((email) => email.trim());
                return emails.every(
                    (email) => z.string().email().safeParse(email).success,
                );
            }, "Please enter valid CC email addresses separated by commas"),
        bcc: z
            .string()
            .optional()
            .refine((value) => {
                if (!value || value.trim() === "") return true;
                const emails = value.split(",").map((email) => email.trim());
                return emails.every(
                    (email) => z.string().email().safeParse(email).success,
                );
            }, "Please enter valid BCC email addresses separated by commas"),
        subject: z.string().min(1, "Subject is required"),
        body: z.string().min(1, "Email body is required"),
    }),
);

export default component$(() => {
    const composeData = useComposeData();
    const sendAction = useSendEmail();
    const saveDraftAction = useSaveDraft();
    const deleteDraftAction = useDeleteDraft();
    const location = useLocation();

    const formData = useStore({
        draftId: composeData.value.currentDraft?.id || "",
        from: composeData.value.currentDraft?.from || "",
        to: composeData.value.currentDraft?.to || "",
        cc: composeData.value.currentDraft?.cc || "",
        bcc: composeData.value.currentDraft?.bcc || "",
        subject: composeData.value.currentDraft?.subject || "",
        body: composeData.value.currentDraft?.body || "",
    });

    const fieldErrors = useStore({
        from: "",
        to: "",
        cc: "",
        bcc: "",
        subject: "",
        body: "",
        general: "",
    });

    useVisibleTask$(({ track }) => {
        track(() => sendAction.value);

        if (sendAction.value?.failed) {
            const errors = sendAction.value.fieldErrors as Record<string, string>;
            fieldErrors.from = errors.from || "";
            fieldErrors.to = errors.to || "";
            fieldErrors.cc = errors.cc || "";
            fieldErrors.bcc = errors.bcc || "";
            fieldErrors.subject = errors.subject || "";
            fieldErrors.body = errors.body || "";
            fieldErrors.general = errors.general || "";

            if (fieldErrors.general) {
                toast.error(fieldErrors.general);
            }
        }

        if (sendAction.value?.success) {
            toast.success("Email sent successfully!");
            // Clear any previous errors
            Object.keys(fieldErrors).forEach((key) => {
                fieldErrors[key as keyof typeof fieldErrors] = "";
            });
        }
    });

    useVisibleTask$(({ track }) => {
        track(() => saveDraftAction.value);

        if (saveDraftAction.value?.failed) {
            const errors = saveDraftAction.value.fieldErrors as Record<string, string>;
            if (errors.general) {
                toast.error(errors.general);
            }
        }

        if (saveDraftAction.value?.success) {
            toast.success("Draft saved successfully!");
            if (saveDraftAction.value.draftId && !formData.draftId) {
                formData.draftId = saveDraftAction.value.draftId;
            }
        }
    });

    useVisibleTask$(({ track }) => {
        track(() => deleteDraftAction.value);

        if (deleteDraftAction.value?.success) {
            toast.success("Draft deleted successfully!");
        }
    });

    return (
        <>
            <BackHeading>Compose New Email</BackHeading>

            <div class="flex flex-col space-y-6">
                {composeData.value.drafts.length > 0 && (
                    <div class="rounded-lg border border-neutral-200 bg-white p-4">
                        <h3 class="mb-2 font-medium text-neutral-900 text-sm">Your Drafts</h3>
                        <div class="flex flex-col space-y-2">
                            {composeData.value.drafts.map((draft) => (
                                <div key={draft.id} class="flex items-center justify-between rounded-md border border-neutral-100 p-3 hover:bg-neutral-50">
                                    <div class="flex-1">
                                        <Link
                                            href={`/workspace/${location.params.workspaceSlug}/compose?draftId=${draft.id}`}
                                            class="block"
                                        >
                                            <p class="font-medium text-neutral-900 text-sm">
                                                {draft.title || draft.subject || "Untitled"}
                                            </p>
                                            <p class="text-neutral-600 text-xs">
                                                {draft.to ? `To: ${draft.to}` : "No recipient"} • {new Date(draft.updatedAt).toLocaleDateString()}
                                            </p>
                                        </Link>
                                    </div>
                                    <Form action={deleteDraftAction}>
                                        <input type="hidden" name="draftId" value={draft.id} />
                                        <Button type="submit" class="text-red-600 text-xs">
                                            Delete
                                        </Button>
                                    </Form>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <Form
                    action={sendAction}
                    class="flex flex-col space-y-4 rounded-lg border border-neutral-200 bg-white p-6"
                >
                    <input type="hidden" name="draftId" value={formData.draftId} />
                    <div class="flex flex-col space-y-4">
                        {/* From Address Selection */}
                        <div class="flex flex-col space-y-2">
                            <label for="from" class="font-medium text-neutral-700 text-sm">
                                From
                            </label>
                            <select
                                id="from"
                                name="from"
                                required
                                value={formData.from}
                                onChange$={(e) => {
                                    formData.from = (e.target as HTMLSelectElement).value;
                                }}
                                class="flex h-9 w-full rounded-md border border-neutral-100 bg-neutral-100 px-3 py-2 text-sm outline-none ring-offset-background transition-all hover:bg-neutral-200 focus-visible:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">Select sender address</option>
                                {composeData.value.addresses.map((address) => (
                                    <option key={address.id} value={address.email}>
                                        {address.email}
                                    </option>
                                ))}
                            </select>
                            {fieldErrors.from && (
                                <p class="text-red-600 text-sm">{fieldErrors.from}</p>
                            )}
                        </div>

                        {/* To Recipients */}
                        <div class="flex flex-col space-y-2">
                            <label for="to" class="font-medium text-neutral-700 text-sm">
                                To
                            </label>
                            <RecipientInput
                                name="to"
                                placeholder="Enter recipient email addresses (separate with commas)"
                                suggestions={composeData.value.contacts}
                                value={formData.to}
                                onInput$={(value) => {
                                    formData.to = value;
                                }}
                            />
                            {fieldErrors.to && (
                                <p class="text-red-600 text-sm">{fieldErrors.to}</p>
                            )}
                        </div>

                        {/* CC Recipients */}
                        <div class="flex flex-col space-y-2">
                            <label for="cc" class="font-medium text-neutral-700 text-sm">
                                CC (optional)
                            </label>
                            <RecipientInput
                                name="cc"
                                placeholder="Enter CC email addresses (separate with commas)"
                                suggestions={composeData.value.contacts}
                                value={formData.cc}
                                onInput$={(value) => {
                                    formData.cc = value;
                                }}
                            />
                            {fieldErrors.cc && (
                                <p class="text-red-600 text-sm">{fieldErrors.cc}</p>
                            )}
                        </div>

                        {/* BCC Recipients */}
                        <div class="flex flex-col space-y-2">
                            <label for="bcc" class="font-medium text-neutral-700 text-sm">
                                BCC (optional)
                            </label>
                            <RecipientInput
                                name="bcc"
                                placeholder="Enter BCC email addresses (separate with commas)"
                                suggestions={composeData.value.contacts}
                                value={formData.bcc}
                                onInput$={(value) => {
                                    formData.bcc = value;
                                }}
                            />
                            {fieldErrors.bcc && (
                                <p class="text-red-600 text-sm">{fieldErrors.bcc}</p>
                            )}
                        </div>

                        {/* Subject */}
                        <div class="flex flex-col space-y-2">
                            <label for="subject" class="font-medium text-neutral-700 text-sm">
                                Subject
                            </label>
                            <Input
                                id="subject"
                                name="subject"
                                placeholder="Enter email subject"
                                value={formData.subject}
                                onInput$={(e, target) => {
                                    formData.subject = target.value;
                                }}
                            />
                            {fieldErrors.subject && (
                                <p class="text-red-600 text-sm">{fieldErrors.subject}</p>
                            )}
                        </div>

                        {/* Email Body */}
                        <div class="flex flex-col space-y-2">
                            <label for="body" class="font-medium text-neutral-700 text-sm">
                                Message
                            </label>
                            <Textarea
                                id="body"
                                name="body"
                                placeholder="Write your email message here..."
                                rows={8}
                                value={formData.body}
                                onInput$={(e, target) => {
                                    formData.body = target.value;
                                }}
                            />
                            {fieldErrors.body && (
                                <p class="text-red-600 text-sm">{fieldErrors.body}</p>
                            )}
                        </div>
                    </div>

                    <div class="flex flex-row justify-between">
                        <Form action={saveDraftAction} preventdefault:submit>
                            <input type="hidden" name="draftId" value={formData.draftId} />
                            <input type="hidden" name="from" value={formData.from} />
                            <input type="hidden" name="to" value={formData.to} />
                            <input type="hidden" name="cc" value={formData.cc} />
                            <input type="hidden" name="bcc" value={formData.bcc} />
                            <input type="hidden" name="subject" value={formData.subject} />
                            <input type="hidden" name="body" value={formData.body} />
                            <Button type="submit" disabled={saveDraftAction.isRunning} class="border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50">
                                {saveDraftAction.isRunning ? "Saving..." : "Save Draft"}
                            </Button>
                        </Form>
                        <div class="flex flex-row space-x-3">
                            <Link
                                href={`/workspace/${location.params.workspaceSlug}`}
                                class="inline-flex cursor-pointer items-center justify-center rounded-xl border border-neutral-300 px-4 py-1 text-lg text-neutral-700 transition-colors hover:bg-neutral-50"
                            >
                                Cancel
                            </Link>
                            <Button type="submit" disabled={sendAction.isRunning}>
                                {sendAction.isRunning ? "Sending..." : "Send Email"}
                            </Button>
                        </div>
                    </div>
                </Form>

                <div class="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                    <h3 class="font-medium text-lg text-neutral-900">Tips</h3>
                    <ul class="mt-2 list-disc space-y-1 pl-5 text-neutral-600 text-sm">
                        <li>Separate multiple recipients with commas</li>
                        <li>Type a name or email to see contact suggestions</li>
                        <li>
                            Use CC for recipients who should see the email but aren't the
                            primary audience
                        </li>
                        <li>
                            Use BCC for recipients who should receive the email privately
                        </li>
                    </ul>
                </div>
            </div>
        </>
    );
});
