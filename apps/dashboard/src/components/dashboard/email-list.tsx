import { component$, type QwikJSX, useStore, useTask$ } from "@builder.io/qwik";

interface EmailAddress {
  name: string | null;
  address: string;
}

interface Email {
  id: string;
  from: EmailAddress[] | null;
  subject: string;
  text: string | null;
}

interface Props {
  fetchEmails: (params: { page: number; take: number }) => Promise<Email[]>;
  EmailComponent: () => QwikJSX.Element;
}

export default component$<Props>(({ fetchEmails }) => {
  const emails = useStore({
    emails: [] as Email[],
  });

  useTask$(async ({ track }) => {
    track(() => fetchEmails);
    emails.emails = await fetchEmails({ page: 0, take: 20 });
  });

  return (
    <div class="flex w-full flex-col rounded-xl border border-neutral-200 bg-white p-2">
      {emails.emails?.map((email) => {
        const fromAddress = email.from?.[0];
        const fromDisplay =
          fromAddress?.name || fromAddress?.address || "Unknown";
        const subject = email.subject;
        const snippet = email.text?.slice(0, 100) || "";
        return (
          <div class="border-neutral-200 border-b px-4 py-2" key={email.id}>
            <p class="font-medium">{fromDisplay}</p>
            <p class="text-neutral-600 text-sm">{subject}</p>
            <p class="text-neutral-500 text-sm">{snippet}</p>
          </div>
        );
      })}
      {emails.emails?.length === 0 && (
        <p class="p-4 text-center text-neutral-500 text-sm">
          No emails found. Reset filters or{" "}
          <button
            class="cursor-pointer text-blue-500 hover:underline"
            onClick$={async () => {
              emails.emails = await fetchEmails({ page: 0, take: 20 });
              console.log(emails.emails);
            }}
            type="button"
          >
            try again
          </button>
          .
        </p>
      )}
    </div>
  );
});
