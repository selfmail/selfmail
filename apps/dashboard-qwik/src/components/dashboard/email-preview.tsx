import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { LuMaximize2, LuX } from "@qwikest/icons/lucide";

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

interface EmailDetail {
  id: string;
  from: unknown;
  to: unknown;
  subject: string;
  text: string | null;
  html: string | null;
  date: Date;
  attachments: unknown;
  contact: Contact | null;
}

interface Props {
  email: EmailDetail;
  onClose: () => void;
  onFullscreen: () => void;
}

const formatDate = (date: Date) => {
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export default component$<Props>(({ email, onClose, onFullscreen }) => {
  const previewRef = useSignal<Element>();

  useVisibleTask$(({ cleanup }) => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        previewRef.value &&
        !previewRef.value.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    cleanup(() => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    });
  });

  const fromArray = Array.isArray(email.from)
    ? (email.from as EmailAddress[])
    : [];
  const toArray = Array.isArray(email.to) ? (email.to as EmailAddress[]) : [];
  const attachmentsArray = Array.isArray(email.attachments)
    ? (email.attachments as Attachment[])
    : [];

  const fromAddress = fromArray[0];
  const fromDisplay = fromAddress?.name || fromAddress?.address || "Unknown";
  const toAddresses =
    toArray.map((addr) => addr.name || addr.address).join(", ") || "";
  const hasAttachments = attachmentsArray.length > 0;
  const BYTES_PER_KB = 1024;

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-end bg-neutral-900/20">
      <div
        class="flex h-full w-full max-w-2xl flex-col overflow-hidden bg-white shadow-2xl"
        ref={previewRef}
      >
        <div class="flex items-center justify-between border-neutral-200 border-b px-6 py-4">
          <h2 class="truncate font-medium text-lg">Email Preview</h2>
          <div class="flex items-center gap-2">
            <button
              class="flex items-center gap-2 rounded-lg px-3 py-2 text-neutral-700 text-sm transition-colors hover:bg-neutral-100"
              onClick$={onFullscreen}
              type="button"
            >
              <LuMaximize2 class="size-4" />
              <span>Fullscreen</span>
            </button>
            <button
              class="rounded-lg p-2 text-neutral-700 transition-colors hover:bg-neutral-100"
              onClick$={onClose}
              type="button"
            >
              <LuX class="size-5" />
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-6">
          <div class="mb-6">
            <h1 class="mb-4 font-medium text-2xl">
              {email.subject || "(No subject)"}
            </h1>

            <div class="mb-4 flex items-start gap-3">
              {email.contact?.image ? (
                <div class="size-12 overflow-hidden rounded-full border border-neutral-200">
                  <div
                    class="size-full"
                    style={`background-image: url(${email.contact.image}); background-size: cover; background-position: center;`}
                    title={fromDisplay}
                  />
                </div>
              ) : (
                <div class="flex size-12 items-center justify-center rounded-full border border-neutral-200 bg-linear-to-br from-neutral-100 to-neutral-200">
                  <span class="font-medium text-neutral-700">
                    {fromDisplay.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              <div class="flex-1">
                <p class="font-medium text-neutral-900">{fromDisplay}</p>
                <p class="text-neutral-600 text-sm">To: {toAddresses}</p>
                <p class="text-neutral-500 text-xs">{formatDate(email.date)}</p>
              </div>
            </div>
          </div>

          {hasAttachments && (
            <div class="mb-6 rounded-lg border border-neutral-200 p-4">
              <p class="mb-2 font-medium text-neutral-900 text-sm">
                {attachmentsArray.length}{" "}
                {attachmentsArray.length === 1 ? "Attachment" : "Attachments"}
              </p>
              <div class="space-y-2">
                {attachmentsArray.map((attachment) => (
                  <div
                    class="flex items-center gap-2 rounded-md bg-neutral-50 px-3 py-2"
                    key={attachment.filename}
                  >
                    <svg
                      class="size-4 text-neutral-600"
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
                    <span class="text-neutral-900 text-sm">
                      {attachment.filename}
                    </span>
                    <span class="text-neutral-500 text-xs">
                      ({Math.round(attachment.size / BYTES_PER_KB)} KB)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div class="prose prose-neutral max-w-none">
            {email.html ? (
              <div dangerouslySetInnerHTML={email.html} />
            ) : (
              <pre class="whitespace-pre-wrap font-sans text-neutral-900 text-sm">
                {email.text || "No content"}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
