import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Link, routeLoader$, useLocation } from "@builder.io/qwik-city";
import {
  LuArchive,
  LuChevronLeft,
  LuMail,
  LuTrash2,
} from "@qwikest/icons/lucide";
import { db } from "database";
import {
  middlewareAuthentication,
  verifyWorkspaceMembership,
} from "~/lib/auth";
import type { MemberInSharedMap } from "../../types";

const useEmail = routeLoader$(async ({ params, sharedMap, cookie }) => {
  const member = sharedMap.get("member") as MemberInSharedMap;

  if (!member) {
    const sessionToken = cookie.get("selfmail-session-token")?.value;
    const workspaceSlug = params.workspaceSlug;

    if (!(workspaceSlug && sessionToken)) {
      throw new Error("No workspace slug or session token provided.");
    }

    const { authenticated, user } =
      await middlewareAuthentication(sessionToken);

    if (!(authenticated && user)) {
      throw new Error("User is not authenticated. Please log in.");
    }

    const { isMember } = await verifyWorkspaceMembership(
      user.id,
      workspaceSlug
    );

    if (!isMember) {
      throw new Error("User is not a member of this workspace. Access denied.");
    }
  }

  const email = await db.email.findFirst({
    where: {
      id: params.emailId,
      address: {
        MemberAddress: {
          some: {
            memberId: member.id,
          },
        },
      },
    },
    include: {
      address: {
        select: {
          email: true,
          id: true,
        },
      },
      contact: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  if (!email) {
    throw new Error("Email not found or you don't have access to it");
  }

  return email;
});

interface EmailAddress {
  name: string | null;
  address: string;
}

interface Attachment {
  filename: string;
  contentType: string;
  size: number;
}

const formatDate = (date: Date) => {
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const BYTES_PER_KB = 1024;

export default component$(() => {
  const email = useEmail();
  const location = useLocation();

  const fromArray = Array.isArray(email.value.from)
    ? (email.value.from as unknown as EmailAddress[])
    : [];
  const toArray = Array.isArray(email.value.to)
    ? (email.value.to as unknown as EmailAddress[])
    : [];
  const ccArray = Array.isArray(email.value.cc)
    ? (email.value.cc as unknown as EmailAddress[])
    : [];
  const attachmentsArray = Array.isArray(email.value.attachments)
    ? (email.value.attachments as unknown as Attachment[])
    : [];

  const fromAddress = fromArray[0];
  const fromDisplay = fromAddress?.name || fromAddress?.address || "Unknown";
  const toAddresses = toArray
    .map((addr) => addr.name || addr.address)
    .join(", ");
  const ccAddresses = ccArray
    .map((addr) => addr.name || addr.address)
    .join(", ");
  const hasAttachments = attachmentsArray.length > 0;
  const hasCc = ccArray.length > 0;

  return (
    <>
      <div class="mb-6 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Link
            class="flex items-center gap-2 text-neutral-700 transition-colors hover:text-neutral-900"
            href={`/workspace/${location.params.workspaceSlug}`}
          >
            <LuChevronLeft class="size-5" />
            <span class="text-sm">Back to Inbox</span>
          </Link>
        </div>

        <div class="flex items-center gap-2">
          <button
            class="flex items-center gap-2 rounded-lg px-3 py-2 text-neutral-700 text-sm transition-colors hover:bg-neutral-100"
            type="button"
          >
            <LuArchive class="size-4" />
            <span>Archive</span>
          </button>
          <button
            class="flex items-center gap-2 rounded-lg px-3 py-2 text-neutral-700 text-sm transition-colors hover:bg-neutral-100"
            type="button"
          >
            <LuMail class="size-4" />
            <span>Mark Unread</span>
          </button>
          <button
            class="flex items-center gap-2 rounded-lg px-3 py-2 text-red-700 text-sm transition-colors hover:bg-red-50"
            type="button"
          >
            <LuTrash2 class="size-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <div class="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <div class="border-neutral-200 border-b p-8">
          <h1 class="mb-6 font-medium text-3xl">
            {email.value.subject || "(No subject)"}
          </h1>

          <div class="flex items-start gap-4">
            {email.value.contact?.image ? (
              <div class="size-14 overflow-hidden rounded-full border border-neutral-200">
                <div
                  class="size-full"
                  style={`background-image: url(${email.value.contact.image}); background-size: cover; background-position: center;`}
                  title={fromDisplay}
                />
              </div>
            ) : (
              <div class="flex size-14 items-center justify-center rounded-full border border-neutral-200 bg-linear-to-br from-neutral-100 to-neutral-200">
                <span class="font-medium text-lg text-neutral-700">
                  {fromDisplay.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            <div class="flex-1">
              <p class="mb-1 font-medium text-lg text-neutral-900">
                {fromDisplay}
              </p>
              <div class="space-y-1 text-neutral-600 text-sm">
                <p>To: {toAddresses}</p>
                {hasCc && <p>Cc: {ccAddresses}</p>}
                <p class="text-neutral-500">{formatDate(email.value.date)}</p>
              </div>
            </div>
          </div>
        </div>

        {hasAttachments && (
          <div class="border-neutral-200 border-b bg-neutral-50 p-6">
            <p class="mb-3 font-medium text-neutral-900 text-sm">
              {attachmentsArray.length}{" "}
              {attachmentsArray.length === 1 ? "Attachment" : "Attachments"}
            </p>
            <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {attachmentsArray.map((attachment) => (
                <div
                  class="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3"
                  key={attachment.filename}
                >
                  <svg
                    class="size-5 shrink-0 text-neutral-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <title>Attachment</title>
                    <path
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                    />
                  </svg>
                  <div class="min-w-0 flex-1">
                    <p class="truncate font-medium text-neutral-900 text-sm">
                      {attachment.filename}
                    </p>
                    <p class="text-neutral-500 text-xs">
                      {Math.round(attachment.size / BYTES_PER_KB)} KB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div class="p-8">
          <div class="prose prose-neutral max-w-none">
            {email.value.html ? (
              <div dangerouslySetInnerHTML={email.value.html} />
            ) : (
              <pre class="whitespace-pre-wrap font-sans text-neutral-900">
                {email.value.text || "No content"}
              </pre>
            )}
          </div>
        </div>
      </div>
    </>
  );
});

export const head: DocumentHead = ({ resolveValue, params }) => {
  const email = resolveValue(useEmail);
  const workspaceSlug = params.workspaceSlug;

  return {
    title: `${email.subject || "(No subject)"} | ${workspaceSlug} | Selfmail`,
    meta: [
      {
        name: "description",
        content: `View email: ${email.subject || "(No subject)"}`,
      },
      {
        name: "robots",
        content: "noindex, nofollow",
      },
    ],
  };
};
