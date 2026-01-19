import { component$, useStore, useVisibleTask$ } from "@builder.io/qwik";
import {
    Form,
    Link,
    routeAction$,
    routeLoader$,
    useLocation,
    z,
    zod$,
} from "@builder.io/qwik-city";
import { db } from "database";
import { toast } from "qwik-sonner";
import BackHeading from "~/components/ui/BackHeading";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import type { MemberInSharedMap } from "../../types";

const useMemberData = routeLoader$(async ({ sharedMap, error }) => {
    const member = sharedMap.get("member") as MemberInSharedMap;

    if (!member || !member.id) {
        throw error(403, "Forbidden");
    }

    // Get the full member data
    const memberData = await db.member.findUnique({
        where: {
            id: member.id,
        },
        select: {
            id: true,
            profileName: true,
            description: true,
            image: true,
        },
    });

    if (!memberData) {
        throw error(404, "Member not found");
    }

    return {
        member: {
            id: memberData.id,
            profileName: memberData.profileName,
            description: memberData.description,
            image: memberData.image,
        },
    };
});

export const useUpdateMemberProfile = routeAction$(
    async ({ profileName, description }, { sharedMap, error }) => {
        const member = sharedMap.get("member") as MemberInSharedMap;

        if (!member || !member.id) {
            throw error(403, "Forbidden");
        }

        try {
            const updatedMember = await db.member.update({
                where: {
                    id: member.id,
                },
                data: {
                    profileName,
                    description: description || null,
                },
            });

            if (!updatedMember) {
                return {
                    fieldErrors: {
                        general: "Failed to update profile",
                    },
                    failed: true,
                };
            }

            return {
                fieldErrors: {},
                failed: false,
                success: true,
            };
        } catch (e) {
            console.error("Error updating member profile:", e);
            return {
                fieldErrors: {
                    general: "Failed to update profile. Please try again.",
                },
                failed: true,
            };
        }
    },
    zod$({
        profileName: z
            .string()
            .min(1, "Profile name is required")
            .min(2, "Profile name must be at least 2 characters")
            .max(50, "Profile name must be at most 50 characters"),
        description: z
            .string()
            .max(200, "Description must be at most 200 characters")
            .optional(),
    }),
);

export default component$(() => {
    const memberData = useMemberData();
    const updateAction = useUpdateMemberProfile();
    const location = useLocation();

    const fieldErrors = useStore({
        profileName: "",
        description: "",
        general: "",
    });

    useVisibleTask$(({ track }) => {
        track(() => updateAction.value);

        if (updateAction.value?.failed) {
            const errors = updateAction.value.fieldErrors as Record<string, string>;
            fieldErrors.profileName = errors.profileName || "";
            fieldErrors.description = errors.description || "";
            fieldErrors.general = errors.general || "";

            if (fieldErrors.general) {
                toast.error(fieldErrors.general);
            }
        }

        if (updateAction.value?.success) {
            toast.success("Profile updated successfully!");
            // Clear any previous errors
            fieldErrors.profileName = "";
            fieldErrors.description = "";
            fieldErrors.general = "";
        }
    });

    return (
        <>
            <div class="flex flex-row items-center justify-between">
                <BackHeading>Member Profile Settings</BackHeading>
                <div class="flex gap-4">
                    <Link
                        href={`/workspace/${location.params.workspaceSlug}/settings`}
                        class="text-blue-500"
                    >
                        Workspace Settings
                    </Link>
                    <Link
                        href="/account"
                        class="text-blue-500"
                    >
                        Account Settings
                    </Link>
                </div>
            </div>

            <div class="flex flex-col space-y-6">
                <Form
                    action={updateAction}
                    class="flex flex-col space-y-4 rounded-lg border border-neutral-200 bg-white p-6"
                >
                    <div class="flex flex-col space-y-2">
                        <h3 class="font-medium text-lg text-neutral-900">
                            Profile Information
                        </h3>
                        <p class="text-neutral-500 text-sm">
                            Update your profile name and description for this workspace.
                        </p>
                    </div>

                    <div class="flex flex-col space-y-4">
                        <div class="flex flex-col space-y-2">
                            <label
                                for="profileName"
                                class="font-medium text-neutral-700 text-sm"
                            >
                                Profile Name
                            </label>
                            <Input
                                id="profileName"
                                name="profileName"
                                placeholder="Enter your profile name"
                                value={memberData.value.member.profileName}
                                required
                            />
                            {fieldErrors.profileName && (
                                <p class="text-red-600 text-sm">{fieldErrors.profileName}</p>
                            )}
                        </div>

                        <div class="flex flex-col space-y-2">
                            <label
                                for="description"
                                class="font-medium text-neutral-700 text-sm"
                            >
                                Description
                            </label>
                            <Input
                                id="description"
                                name="description"
                                placeholder="Enter a brief description about yourself (optional)"
                                value={memberData.value.member.description || ""}
                            />
                            {fieldErrors.description && (
                                <p class="text-red-600 text-sm">{fieldErrors.description}</p>
                            )}
                        </div>
                    </div>

                    <div class="flex flex-row justify-end">
                        <Button type="submit" disabled={updateAction.isRunning}>
                            {updateAction.isRunning ? "Updating..." : "Update Profile"}
                        </Button>
                    </div>
                </Form>

                <div class="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
                    <div class="flex flex-col space-y-2">
                        <h3 class="font-medium text-lg text-neutral-900">
                            Profile Picture
                        </h3>
                        <p class="text-neutral-500 text-sm">
                            Profile picture management will be available soon.
                        </p>
                    </div>

                    <div class="mt-4 flex items-center space-x-4">
                        {memberData.value.member.image ? (
                            <img
                                src={memberData.value.member.image}
                                alt="Profile"
                                class="h-16 w-16 rounded-full object-cover"
                            />
                        ) : (
                            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-300 font-medium text-lg text-neutral-600">
                                {memberData.value.member.profileName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div class="flex flex-col">
                            <p class="font-medium text-neutral-700 text-sm">
                                {memberData.value.member.profileName}
                            </p>
                            <p class="text-neutral-500 text-xs">
                                {memberData.value.member.description || "No description"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
});
