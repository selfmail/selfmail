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

const useComposeData = routeLoader$(async ({ sharedMap, error }) => {
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

    return {
        addresses: memberAddresses.map((ma) => ({
            id: ma.address.id,
            email: ma.address.email,
        })),
        contacts,
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
    const location = useLocation();

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

    return (
        <>
            <BackHeading>Compose New Email</BackHeading>

            <div class="flex flex-col space-y-6">
                <Form
                    action={sendAction}
                    class="flex flex-col space-y-4 rounded-lg border border-neutral-200 bg-white p-6"
                >
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
                                required
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
                                required
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
                                required
                            />
                            {fieldErrors.body && (
                                <p class="text-red-600 text-sm">{fieldErrors.body}</p>
                            )}
                        </div>
                    </div>

                    <div class="flex flex-row justify-end space-x-3">
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
