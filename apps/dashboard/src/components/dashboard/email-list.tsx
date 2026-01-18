import {
  $,
  component$,
  type QRL,
  type QwikJSX,
  useStore,
  useTask$,
} from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";

interface EmailAddress {
  name: string | null;
  address: string;
}

interface Attachment {
  filename: string;
  contentType: string;
  size: number;
}

interface Contact {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface Email {
  id: string;
  from: EmailAddress[] | null;
  subject: string;
  text: string | null;
  read: boolean;
  date: Date;
  attachments: Attachment[] | null;
  contact: Contact | null;
}

interface Props {
  fetchEmails: (params: { page: number; take: number }) => Promise<Email[]>;
  EmailComponent: () => QwikJSX.Element;
}

interface EmailItemProps {
  email: Email;
  isLast: boolean;
  formatRelativeTime: QRL<(date: Date) => string>;
  onEmailClick: (emailId: string) => void;
}

const EMAILS_PER_PAGE = 20;
const SNIPPET_LENGTH = 120;
const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;

const EmailItem = component$<EmailItemProps>(
  ({ email, isLast, formatRelativeTime, onEmailClick }) => {
    const fromAddress = email.from?.[0];
    const fromDisplay = fromAddress?.name || fromAddress?.address || "Unknown";
    const subject = email.subject || "(No subject)";
    const snippet = email.text?.slice(0, SNIPPET_LENGTH) || "";
    const hasAttachments = email.attachments && email.attachments.length > 0;
    const attachmentCount = email.attachments?.length || 0;
    const contactImage = email.contact?.image;
    const borderClass = isLast ? "" : "border-b border-neutral-200";

    return (
      <div
        class={`group cursor-pointer px-4 py-3 transition-colors hover:bg-neutral-50 ${borderClass}`}
        onClick$={() => onEmailClick(email.id)}
      >
        <div class="flex items-start gap-3">
          <div class="mt-1 shrink-0">
            {contactImage ? (
              <div class="size-10 overflow-hidden rounded-full border border-neutral-200">
                <div
                  class="size-full"
                  style={`background-image: url(${contactImage}); background-size: cover; background-position: center;`}
                  title={fromDisplay}
                />
              </div>
            ) : (
              <div class="flex size-10 items-center justify-center rounded-full border border-neutral-200 bg-linear-to-br from-neutral-100 to-neutral-200">
                <span class="font-medium text-neutral-700 text-sm">
                  {fromDisplay.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div class="min-w-0 flex-1">
            <div class="mb-1 flex items-baseline justify-between gap-2">
              <div class="flex min-w-0 items-center gap-2">
                <p
                  class={`truncate font-medium text-sm ${email.read ? "text-neutral-700" : "text-neutral-900"}`}
                >
                  {fromDisplay}
                </p>
                {email.read ? null : (
                  <span class="size-2 shrink-0 rounded-full bg-neutral-900" />
                )}
              </div>
              <span class="shrink-0 text-neutral-500 text-xs">
                {formatRelativeTime(email.date)}
              </span>
            </div>

            <p
              class={`mb-1 truncate text-sm ${email.read ? "text-neutral-600" : "font-medium text-neutral-900"}`}
            >
              {subject}
            </p>

            <p class="mb-1 line-clamp-2 text-neutral-500 text-sm">{snippet}</p>

            {hasAttachments && (
              <div class="mt-2 flex items-center gap-1 text-neutral-600 text-xs">
                <svg
                  class="size-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Attachment icon</title>
                  <path
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                  />
                </svg>
                <span>
                  {attachmentCount}{" "}
                  {attachmentCount === 1 ? "attachment" : "attachments"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

export default component$<Props>(({ fetchEmails }) => {
  const emails = useStore({
    emails: [] as Email[],
  });
  const nav = useNavigate();
  const location = useLocation();

  useTask$(async ({ track }) => {
    track(() => fetchEmails);
    emails.emails = await fetchEmails({ page: 0, take: EMAILS_PER_PAGE });
  });

  const formatRelativeTime = $((date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const seconds = Math.floor(diff / MILLISECONDS_PER_SECOND);
    const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
    const hours = Math.floor(minutes / MINUTES_PER_HOUR);
    const days = Math.floor(hours / HOURS_PER_DAY);

    if (days > 0) {
      return `${days}d ago`;
    }
    if (hours > 0) {
      return `${hours}h ago`;
    }
    if (minutes > 0) {
      return `${minutes}m ago`;
    }
    return "Just now";
  });

  const handleEmailClick = $((emailId: string) => {
    const currentPath = location.url.pathname;
    nav(`${currentPath}?emailId=${emailId}`);
  });

  return (
    <div class="flex w-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white">
      {emails.emails?.map((email, index) => (
        <EmailItem
          email={email}
          formatRelativeTime={formatRelativeTime}
          isLast={index === emails.emails.length - 1}
          key={email.id}
          onEmailClick={handleEmailClick}
        />
      ))}
      {emails.emails?.length === 0 && (
        <p class="p-8 text-center text-neutral-500 text-sm">
          No emails found. Reset filters or{" "}
          <button
            class="cursor-pointer text-neutral-900 hover:underline"
            onClick$={async () => {
              emails.emails = await fetchEmails({
                page: 0,
                take: EMAILS_PER_PAGE,
              });
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
