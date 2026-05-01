import { PaperclipIcon } from "lucide-react";
import { cn } from "#/lib/utils";
import { useViewedEmailStore } from "#/stores/viewed-email";
import type { Email } from "./types";

interface EmailListProps {
  emails: Email[];
}

interface EmailItemProps {
  email: Email;
  isLast: boolean;
  onSelect: (emailId: string) => void;
}

function EmailItem({ email, isLast, onSelect }: EmailItemProps) {
  return (
    <button
      className={cn(
        "group cursor-pointer px-4 py-3 text-left transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300",
        !isLast && "border-neutral-200 border-b"
      )}
      onClick={() => onSelect(email.id)}
      type="button"
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 shrink-0">
          <div className="flex size-10 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100">
            <span className="font-medium text-neutral-700 text-sm">
              {email.initial}
            </span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <p
                className={cn(
                  "truncate font-medium text-sm",
                  email.read ? "text-neutral-700" : "text-neutral-900"
                )}
              >
                {email.from}
              </p>
              {email.read ? null : (
                <span className="size-2 shrink-0 rounded-full bg-neutral-900" />
              )}
            </div>
            <span className="shrink-0 text-neutral-500 text-xs">
              {email.date}
            </span>
          </div>
          <p
            className={cn(
              "mb-1 truncate text-sm",
              email.read ? "text-neutral-600" : "font-medium text-neutral-900"
            )}
          >
            {email.subject}
          </p>
          <p className="mb-1 line-clamp-2 text-neutral-500 text-sm">
            {email.snippet}
          </p>
          {email.attachments ? (
            <div className="mt-2 flex items-center gap-1 text-neutral-600 text-xs">
              <PaperclipIcon className="size-3.5" />
              <span>
                {email.attachments}{" "}
                {email.attachments === 1 ? "attachment" : "attachments"}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </button>
  );
}

export function EmailList({ emails }: EmailListProps) {
  const setEmailId = useViewedEmailStore((state) => state.setEmailId);

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white">
      {emails.map((email, index) => (
        <EmailItem
          email={email}
          isLast={index === emails.length - 1}
          key={email.id}
          onSelect={setEmailId}
        />
      ))}
    </div>
  );
}
