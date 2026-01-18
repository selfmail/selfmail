import { $, component$, useSignal, useTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import {
  Link,
  routeLoader$,
  server$,
  useLocation,
  useNavigate,
  z,
} from "@builder.io/qwik-city";
import { LuChevronLeft } from "@qwikest/icons/lucide";
import { db } from "database";
import EmailList from "~/components/dashboard/email-list";
import EmailPreview from "~/components/dashboard/email-preview";
import {
  middlewareAuthentication,
  verifyWorkspaceMembership,
} from "~/lib/auth";
import type { MemberInSharedMap } from "../../types";

const fetchEmails = server$(async function ({
  page = 0,
  take = 20,
}: {
  page: number;
  take: number;
}) {
  const parse = await z
    .object({
      page: z.number().min(0).default(0),
      take: z.number().min(1).max(100).default(20),
    })
    .safeParseAsync({ page, take });

  if (!parse.success) {
    throw new Error("Invalid parameters");
  }
  let currentMember = this.sharedMap.get("member") as MemberInSharedMap;

  if (!currentMember) {
    const sessionToken = this.cookie.get("selfmail-session-token")?.value;
    const workspaceSlug = this.params.workspaceSlug;

    if (!(workspaceSlug && sessionToken)) {
      throw new Error("No workspace slug or session token provided.");
    }

    const { authenticated, user } =
      await middlewareAuthentication(sessionToken);

    if (!(authenticated && user)) {
      throw new Error("User is not authenticated. Please log in.");
    }

    const { isMember, member, workspace } = await verifyWorkspaceMembership(
      user.id,
      workspaceSlug
    );

    if (!(isMember && member && workspace)) {
      throw new Error("User is not a member of this workspace. Access denied.");
    }
    currentMember = member;
  }
  const emails = await db.email.findMany({
    where: {
      sort: {
        notIn: ["sent", "spam", "trash"],
      },
      address: {
        id: this.params.addressId,
        MemberAddress: {
          every: {
            memberId: currentMember.id,
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: parse.data.page * parse.data.take,
    take: parse.data.take,
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

  return emails;
});

const fetchEmailById = server$(async function (emailId: string) {
  const parsed = z.string().uuid().safeParse(emailId);

  if (!parsed.success) {
    throw new Error("Invalid email ID");
  }

  let currentMember = this.sharedMap.get("member") as MemberInSharedMap;

  if (!currentMember) {
    const sessionToken = this.cookie.get("selfmail-session-token")?.value;
    const workspaceSlug = this.params.workspaceSlug;

    if (!(workspaceSlug && sessionToken)) {
      throw new Error("No workspace slug or session token provided.");
    }

    const { authenticated, user } =
      await middlewareAuthentication(sessionToken);

    if (!(authenticated && user)) {
      throw new Error("User is not authenticated. Please log in.");
    }

    const { isMember, member, workspace } = await verifyWorkspaceMembership(
      user.id,
      workspaceSlug
    );

    if (!(isMember && member && workspace)) {
      throw new Error("User is not a member of this workspace. Access denied.");
    }
    currentMember = member;
  }

  const email = await db.email.findFirst({
    where: {
      id: parsed.data,
      addressId: this.params.addressId,
      address: {
        MemberAddress: {
          some: {
            memberId: currentMember.id,
          },
        },
      },
    },
    include: {
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
    throw new Error("Email not found");
  }

  return email;
});

const useAddress = routeLoader$(async ({ sharedMap, params }) => {
  const member = sharedMap.get("member") as MemberInSharedMap;

  if (!member) {
    throw new Error("Member not found in shared map");
  }

  const address = await db.address.findUnique({
    where: {
      id: params.addressId,
      MemberAddress: {
        every: {
          memberId: member.id,
        },
      },
    },
    select: {
      email: true,
      id: true,
    },
  });

  if (!address) {
    throw new Error("Address not found");
  }

  return address;
});

const useEmailCount = routeLoader$(async ({ sharedMap, params }) => {
  const member = sharedMap.get("member") as MemberInSharedMap;

  if (!member) {
    return 0;
  }

  const count = await db.email.count({
    where: {
      sort: {
        notIn: ["sent", "spam", "trash"],
      },
      address: {
        id: params.addressId,
        MemberAddress: {
          every: {
            memberId: member.id,
          },
        },
      },
    },
  });

  return count;
});

export default component$(() => {
  const count = useEmailCount();
  const address = useAddress();
  const location = useLocation();
  const nav = useNavigate();
  const selectedEmail = useSignal<Awaited<
    ReturnType<typeof fetchEmailById>
  > | null>(null);

  useTask$(async ({ track }) => {
    track(() => location.url.searchParams.get("emailId"));
    const emailId = location.url.searchParams.get("emailId");

    if (emailId) {
      try {
        selectedEmail.value = await fetchEmailById(emailId);
      } catch {
        selectedEmail.value = null;
      }
    } else {
      selectedEmail.value = null;
    }
  });

  const getEmailsAction = $(async (params: { page: number; take: number }) => {
    const emails = await fetchEmails(params);
    return emails;
  });

  const handleClosePreview = $(() => {
    const currentPath = location.url.pathname;
    nav(currentPath);
  });

  const handleFullscreen = $(() => {
    const emailId = location.url.searchParams.get("emailId");
    if (emailId) {
      nav(`/workspace/${location.params.workspaceSlug}/email/${emailId}`);
    }
  });

  const Email = $(() => <div>Email Component</div>);

  return (
    <>
      <div class="flex w-full flex-row items-center justify-between">
        <div class="flex flex-col gap-1">
          <h1 class="flex flex-row items-center space-x-1 font-medium text-2xl">
            <Link
              class="text-neutral-500"
              href={`/workspace/${location.params.workspaceSlug}`}
            >
              <LuChevronLeft />
            </Link>
            <span>Emails for {address.value.email}</span>
          </h1>
          <p class="text-neutral-600">{count.value} emails</p>
        </div>
      </div>
      {/* @ts-expect-error Server Component */}
      <EmailList EmailComponent={Email} fetchEmails={getEmailsAction} />

      {selectedEmail.value && (
        <EmailPreview
          email={selectedEmail.value}
          onClose={handleClosePreview}
          onFullscreen={handleFullscreen}
        />
      )}
    </>
  );
});

export const head: DocumentHead = ({ resolveValue, params }) => {
  const address = resolveValue(useAddress);
  const emailCount = resolveValue(useEmailCount);
  const workspaceSlug = params.workspaceSlug;

  return {
    title: `${address.email} - ${emailCount} emails | ${workspaceSlug} | Selfmail`,
    meta: [
      {
        name: "description",
        content: `Manage ${emailCount} emails for ${address.email} in ${workspaceSlug} workspace on Selfmail.`,
      },
      {
        property: "og:title",
        content: `${address.email} - ${emailCount} emails | ${workspaceSlug} | Selfmail`,
      },
      {
        property: "og:description",
        content: `Manage ${emailCount} emails for ${address.email} in ${workspaceSlug} workspace on Selfmail.`,
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        name: "robots",
        content: "noindex, nofollow",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: `https://app.selfmail.com/workspace/${workspaceSlug}/address/${params.addressId}`,
      },
    ],
  };
};
