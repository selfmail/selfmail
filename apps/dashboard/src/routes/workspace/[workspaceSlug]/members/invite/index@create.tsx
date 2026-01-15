import { component$, useStore, useVisibleTask$ } from "@builder.io/qwik";
import {
    Form,
    routeAction$,
    routeLoader$,
    z,
    zod$,
} from "@builder.io/qwik-city";
import { init } from "@paralleldrive/cuid2";
import { db, type Workspace } from "database";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { hasPermissions } from "~/lib/permissions";
import type { MemberInSharedMap, UserInSharedMap } from "../../types";

export const useInviteMember = routeAction$(
    async ({ invitation: { email, role } }, { redirect, error, params, sharedMap }) => {
        const parse = await z
            .string()
            .email("Please enter a valid email address")
            .min(1, "Email is required")
            .safeParseAsync(email);
        if (!parse.success) {
            return {
                fieldErrors: {
                    email: parse.error.errors[0].message,
                },
                failed: true,
            };
        }

        const workspace = sharedMap.get("workspace") as Workspace;
        const member = sharedMap.get("member") as MemberInSharedMap;

        if (!workspace || !workspace.id) {
            throw error(400, "Workspace not found. Try again or contact us.");
        }

        if (!member || !member.id) {
            throw error(401, "Unauthorized");
        }

        // Check if user is already a member of this workspace
        const existingMember = await db.member.findFirst({
            where: {
                user: {
                    email,
                },
            },
        });

        if (existingMember) {
            return {
                fieldErrors: {
                    email: "This user is already a member of this workspace.",
                },
            };
        }

        const createId = init({
            length: 16,
        });

        const invitationToken = `inv_${createId()}`;

        // check whether the role exists in the db
        if (role !== "ADMIN" && role !== "MEMBER") {
            const dbRole = await db.role.findUnique({
                where: {
                    id: role
                },
            });

            if (!dbRole) {
                return {
                    fieldErrors: {
                        role: "The selected role does not exist.",
                    },
                    failed: true,
                };
            }
        }

        const invitation = await db.invitation.create({
            data: {
                email,
                token: invitationToken,
                roleId: !(role === "ADMIN" || role === "MEMBER") ? role : undefined,
                inviteAsAdmin: role === "ADMIN",
                invitedById: member.id,
                workspaceId: workspace.id,
            },
        });

        if (!invitation) {
            return {
                fieldErrors: {
                    email: "Failed to create invitation. Please try again.",
                },
                failed: true,
            };
        }

        // TODO: Send actual invitation email here
        // Example: await sendInvitationEmail(email, invitationToken, workspace.name);

        redirect(
            302,
            `/workspace/${params.workspaceSlug}/members?invited=${email}`,
        );
    },
    zod$({
        invitation: z.object({
            email: z
                .string()
                .email("Please enter a valid email address")
                .min(1, "Email is required"),
            role: z.string().optional(),
        }),
    }),
);

const useLimits = routeLoader$(async ({ sharedMap, error }) => {
    if (!sharedMap.has("user") || !sharedMap.get("user").id) {
        throw error(401, "Unauthorized");
    }

    const user = sharedMap.get("user") as UserInSharedMap;

    if (!sharedMap.has("member") || !sharedMap.get("member").id) {
        throw error(401, "Unauthorized");
    }

    const member = sharedMap.get("member") as MemberInSharedMap;

    if (
        !sharedMap.has("workspace") ||
        !sharedMap.get("workspace").id ||
        !sharedMap.get("workspace").ownerId
    ) {
        throw error(400, "Workspace not found in shared map");
    }

    const workspace = sharedMap.get("workspace") as Workspace;

    const permissions = await hasPermissions({
        memberId: member.id,
        workspaceId: member.workspaceId,
        permissions: ["invite:member"],
    });

    if (!permissions && user.id !== workspace.ownerId) {
        throw error(403, "You do not have permission to invite new members");
    }

    return {
        canAddMore: true,
    };
});

export default component$(() => {
    const invite = useInviteMember();

    const fieldErrors = useStore({
        email: "",
        role: "",
    });

    useVisibleTask$(async ({ track }) => {
        track(() => invite.value?.fieldErrors);

        if (invite.value?.failed) {
            const errors = invite.value.fieldErrors as Record<string, string>;
            fieldErrors.email = errors.email || "";
            fieldErrors.role = errors.role || "";
        }
    });

    return (
        <div class="flex min-h-screen w-full items-center justify-center bg-neutral-50">
            <Form action={invite} class="flex w-full max-w-md flex-col gap-4">
                <h1 class="font-medium text-2xl">Invite Team Member</h1>
                <p class="text-neutral-500 text-sm">
                    Send an invitation to a new team member. They will receive an email
                    with instructions to join your workspace.
                </p>

                <div class="flex flex-col gap-2">
                    <label for="email" class="font-medium text-sm">
                        Email Address
                    </label>
                    <Input
                        id="email"
                        name="invitation.email"
                        type="email"
                        placeholder="colleague@company.com"
                        required
                    />
                    {fieldErrors.email && (
                        <p class="text-red-700 text-sm">{fieldErrors.email}</p>
                    )}
                </div>

                <div class="flex flex-col gap-2">
                    <label for="role" class="font-medium text-sm">
                        Role
                    </label>
                    <select
                        id="role"
                        name="invitation.role"
                        class="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="MEMBER">Member</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                    {fieldErrors.role && (
                        <p class="text-red-700 text-sm">{fieldErrors.role}</p>
                    )}
                </div>

                <Button
                    type="submit"
                    class="disabled:cursor-not-allowed disabled:active:scale-100"
                    disabled={invite.isRunning}
                >
                    {invite.isRunning
                        ? "Sending invitation..."
                        : "Send Invitation"}
                </Button>
            </Form>
        </div>
    );
});
