import { $, component$, useStore, useVisibleTask$ } from "@builder.io/qwik";
import {
  Form,
  routeAction$,
  routeLoader$,
  server$,
  useNavigate,
  z,
  zod$,
} from "@builder.io/qwik-city";
import { db } from "database";
import { toast } from "qwik-sonner";
import AlertDialog from "~/components/ui/AlertDialog";
import BackHeading from "~/components/ui/BackHeading";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { middlewareAuthentication } from "~/lib/auth";
import type { UserInSharedMap } from "./layout";

const MIN_NAME_LENGTH = 1;
const MIN_NAME_LENGTH_WITH_MESSAGE = 2;
const MAX_NAME_LENGTH = 100;
const MIN_EMAIL_LENGTH = 1;
const HTTP_FORBIDDEN = 403;

const useUserData = routeLoader$(({ sharedMap, error }) => {
  const user = sharedMap.get("user") as UserInSharedMap;

  if (!user?.id) {
    throw error(HTTP_FORBIDDEN, "Forbidden");
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name || "",
      emailVerified: user.emailVerified,
    },
  };
});

export const useUpdateName = routeAction$(
  async ({ name }, { sharedMap, error }) => {
    const user = sharedMap.get("user") as UserInSharedMap;

    if (!user?.id) {
      throw error(HTTP_FORBIDDEN, "Forbidden");
    }

    try {
      const updatedUser = await db.user.update({
        where: {
          id: user.id,
        },
        data: {
          name,
        },
      });

      if (!updatedUser) {
        return {
          fieldErrors: {
            general: "Failed to update name",
          },
          failed: true,
        };
      }

      return {
        fieldErrors: {},
        failed: false,
        success: true,
      };
    } catch (_e) {
      return {
        fieldErrors: {
          general: "Failed to update name. Please try again.",
        },
        failed: true,
      };
    }
  },
  zod$({
    name: z
      .string()
      .min(MIN_NAME_LENGTH, "Name is required")
      .min(MIN_NAME_LENGTH_WITH_MESSAGE, "Name must be at least 2 characters")
      .max(MAX_NAME_LENGTH, "Name must be at most 100 characters"),
  })
);

export const useUpdateEmail = routeAction$(
  async ({ email }, { sharedMap, error }) => {
    const user = sharedMap.get("user") as UserInSharedMap;

    if (!user?.id) {
      throw error(HTTP_FORBIDDEN, "Forbidden");
    }

    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser && existingUser.id !== user.id) {
      return {
        fieldErrors: {
          email: "This email is already in use",
        },
        failed: true,
      };
    }

    try {
      const updatedUser = await db.user.update({
        where: {
          id: user.id,
        },
        data: {
          email,
          emailVerified: null,
        },
      });

      if (!updatedUser) {
        return {
          fieldErrors: {
            general: "Failed to update email",
          },
          failed: true,
        };
      }

      return {
        fieldErrors: {},
        failed: false,
        success: true,
      };
    } catch (_e) {
      return {
        fieldErrors: {
          general: "Failed to update email. Please try again.",
        },
        failed: true,
      };
    }
  },
  zod$({
    email: z
      .string()
      .min(MIN_EMAIL_LENGTH, "Email is required")
      .email("Invalid email address"),
  })
);

const deleteUserAccount = server$(async function () {
  let userId: string | undefined;

  const user = this.sharedMap.get("user") as UserInSharedMap;

  if (user) {
    userId = user.id;
  } else {
    const sessionToken = this.cookie.get("selfmail-session-token")?.value;

    if (!sessionToken) {
      throw new Error("No session token provided.");
    }

    const { authenticated, user: authenticatedUser } =
      await middlewareAuthentication(sessionToken);

    if (!(authenticated && authenticatedUser)) {
      throw new Error("User is not authenticated. Please log in.");
    }

    userId = authenticatedUser.id;
  }

  if (!userId) {
    throw new Error("User ID not found.");
  }

  try {
    await db.$transaction([
      db.account.deleteMany({
        where: {
          userId,
        },
      }),
      db.session.deleteMany({
        where: {
          userId,
        },
      }),
      db.emailVerification.deleteMany({
        where: {
          userId,
        },
      }),
      db.twoFactorToken.deleteMany({
        where: {
          userId,
        },
      }),
      db.magicLink.deleteMany({
        where: {
          userId,
        },
      }),
      db.notification.deleteMany({
        where: {
          userId,
        },
      }),
      db.invitation.deleteMany({
        where: {
          userId,
        },
      }),
      db.activity.deleteMany({
        where: {
          userId,
        },
      }),
      db.smtpCredentials.deleteMany({
        where: {
          userId,
        },
      }),
      db.member.deleteMany({
        where: {
          userId,
        },
      }),
      db.user.delete({
        where: {
          id: userId,
        },
      }),
    ]);

    this.cookie.delete("selfmail-session-token", { path: "/" });

    return {
      success: true,
    };
  } catch (_error) {
    return {
      success: false,
      message: "Failed to delete account",
    };
  }
});

export default component$(() => {
  const userData = useUserData();
  const updateNameAction = useUpdateName();
  const updateEmailAction = useUpdateEmail();
  const navigate = useNavigate();

  const nameFieldErrors = useStore({
    name: "",
    general: "",
  });

  const emailFieldErrors = useStore({
    email: "",
    general: "",
  });

  useVisibleTask$(({ track }) => {
    track(() => updateNameAction.value);

    if (updateNameAction.value?.failed) {
      const errors = updateNameAction.value.fieldErrors as Record<
        string,
        string
      >;
      nameFieldErrors.name = errors.name || "";
      nameFieldErrors.general = errors.general || "";

      if (nameFieldErrors.general) {
        toast.error(nameFieldErrors.general);
      }
    }

    if (updateNameAction.value?.success) {
      toast.success("Name updated successfully!");
      nameFieldErrors.name = "";
      nameFieldErrors.general = "";
    }
  });

  useVisibleTask$(({ track }) => {
    track(() => updateEmailAction.value);

    if (updateEmailAction.value?.failed) {
      const errors = updateEmailAction.value.fieldErrors as Record<
        string,
        string
      >;
      emailFieldErrors.email = errors.email || "";
      emailFieldErrors.general = errors.general || "";

      if (emailFieldErrors.general) {
        toast.error(emailFieldErrors.general);
      } else if (emailFieldErrors.email) {
        toast.error(emailFieldErrors.email);
      }
    }

    if (updateEmailAction.value?.success) {
      toast.success(
        "Email updated successfully! Please verify your new email."
      );
      emailFieldErrors.email = "";
      emailFieldErrors.general = "";
    }
  });

  return (
    <>
      <BackHeading>Account Settings</BackHeading>

      <div class="flex flex-col space-y-6">
        <Form
          action={updateNameAction}
          class="flex flex-col space-y-4 rounded-lg border border-neutral-200 bg-white p-6"
        >
          <div class="flex flex-col space-y-2">
            <h3 class="font-medium text-lg text-neutral-900">Display Name</h3>
            <p class="text-neutral-500 text-sm">
              Update your account display name.
            </p>
          </div>
          <div class="flex flex-col space-y-2">
            <label class="font-medium text-neutral-700 text-sm" for="name">
              Name
            </label>
            <Input
              id="name"
              name="name"
              placeholder="Enter your name"
              required
              value={userData.value.user.name}
            />
            {nameFieldErrors.name && (
              <p class="text-red-600 text-sm">{nameFieldErrors.name}</p>
            )}
          </div>
          <div class="flex flex-row justify-end">
            <Button disabled={updateNameAction.isRunning} type="submit">
              {updateNameAction.isRunning ? "Updating..." : "Update Name"}
            </Button>
          </div>
        </Form>

        <Form
          action={updateEmailAction}
          class="flex flex-col space-y-4 rounded-lg border border-neutral-200 bg-white p-6"
        >
          <div class="flex flex-col space-y-2">
            <h3 class="font-medium text-lg text-neutral-900">Email Address</h3>
            <p class="text-neutral-500 text-sm">
              Update your account email address. You will need to verify your
              new email.
            </p>
          </div>
          <div class="flex flex-col space-y-2">
            <label class="font-medium text-neutral-700 text-sm" for="email">
              Email
            </label>
            <Input
              id="email"
              name="email"
              placeholder="Enter your email"
              required
              type="email"
              value={userData.value.user.email}
            />
            {emailFieldErrors.email && (
              <p class="text-red-600 text-sm">{emailFieldErrors.email}</p>
            )}
            {userData.value.user.emailVerified ? (
              <p class="text-green-600 text-sm">Email verified</p>
            ) : (
              <p class="text-sm text-yellow-600">Email not verified</p>
            )}
          </div>
          <div class="flex flex-row justify-end">
            <Button disabled={updateEmailAction.isRunning} type="submit">
              {updateEmailAction.isRunning ? "Updating..." : "Update Email"}
            </Button>
          </div>
        </Form>

        <div class="rounded-lg border border-red-200 bg-red-50 p-6">
          <div class="flex flex-col space-y-2">
            <h3 class="font-medium text-lg text-red-900">Danger Zone</h3>
            <p class="text-red-700 text-sm">
              Once you delete your account, there is no going back. Please be
              certain.
            </p>
          </div>

          <div class="mt-4">
            <AlertDialog
              class="bg-red-600 hover:bg-red-700"
              description="Are you sure you want to delete your account? This will permanently delete your account and all associated data including workspaces, members, domains, and email addresses. This action cannot be undone."
              proceedAction={$(async () => {
                const result = await deleteUserAccount();
                if (result.success) {
                  toast.success("Account deleted successfully");
                  navigate("/auth/login");
                } else {
                  toast.error(result.message || "Failed to delete account");
                }
              })}
              proceedActionText="Delete Account"
              title="Delete Account?"
            >
              Delete Account
            </AlertDialog>
          </div>
        </div>
      </div>
    </>
  );
});
