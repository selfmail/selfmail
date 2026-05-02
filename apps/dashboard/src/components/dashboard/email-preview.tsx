import { Maximize2Icon, PaperclipIcon, XIcon } from "lucide-react";
import { m } from "#/paraglide/messages";
import { useViewedEmailStore } from "#/stores/viewed-email";
import type { Email } from "./types";

interface EmailAttachmentsProps {
	email: Email;
}

interface EmailPreviewProps {
	emails: Email[];
}

function formatAttachmentCount(count: number) {
	return count === 1
		? m["dashboard.email.attachment_count_one"]({ count })
		: m["dashboard.email.attachment_count"]({ count });
}

function EmailAttachments({ email }: EmailAttachmentsProps) {
	if (!email.attachments) {
		return null;
	}

	return (
		<div className="mb-6 rounded-lg border border-neutral-200 p-4">
			<p className="mb-2 font-medium text-neutral-900 text-sm">
				{formatAttachmentCount(email.attachments)}
			</p>
			<div className="space-y-2">
				{Array.from({ length: email.attachments }, (_, index) => (
					<div
						className="flex items-center gap-2 rounded-md bg-neutral-50 px-3 py-2"
						key={`${email.id}-attachment-${index.toString()}`}
					>
						<PaperclipIcon className="size-4 text-neutral-600" />
						<span className="text-neutral-900 text-sm">
							{m["dashboard.email.attachment_label"]({ number: index + 1 })}
						</span>
						<span className="text-neutral-500 text-xs">
							({m["dashboard.email.attachment_size"]()})
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

export function EmailPreview({ emails }: EmailPreviewProps) {
	const closePreview = useViewedEmailStore((state) => state.closePreview);
	const emailId = useViewedEmailStore((state) => state.emailId);
	const email = emails.find((sampleEmail) => sampleEmail.id === emailId);

	if (!email) {
		return null;
	}

	return (
		<aside className="fixed inset-y-0 right-0 z-50 hidden w-full max-w-2xl flex-col overflow-hidden bg-white shadow-2xl xl:flex">
			<div className="flex items-center justify-between border-neutral-200 border-b px-6 py-4">
				<h2 className="truncate font-medium text-lg">
					{m["dashboard.email.preview_title"]()}
				</h2>
				<div className="flex items-center gap-2">
					<button
						className="flex items-center gap-2 rounded-lg px-3 py-2 text-neutral-700 text-sm transition-colors hover:bg-neutral-100"
						type="button"
					>
						<Maximize2Icon className="size-4" />
						<span>{m["dashboard.email.fullscreen"]()}</span>
					</button>
					<button
						aria-label={m["dashboard.email.close_preview"]()}
						className="rounded-lg p-2 text-neutral-700 transition-colors hover:bg-neutral-100"
						onClick={closePreview}
						type="button"
					>
						<XIcon className="size-5" />
					</button>
				</div>
			</div>
			<div className="flex-1 overflow-y-auto p-6">
				<div className="mb-6">
					<h1 className="mb-4 text-balance font-medium text-2xl">
						{email.subject}
					</h1>
					<div className="mb-4 flex items-start gap-3">
						<div className="flex size-12 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100">
							<span className="font-medium text-neutral-700">
								{email.initial}
							</span>
						</div>
						<div className="flex-1">
							<p className="font-medium text-neutral-900">{email.from}</p>
							{email.to ? (
								<p className="text-neutral-600 text-sm">
									{m["dashboard.email.to"]({ address: email.to })}
								</p>
							) : null}
							<p className="text-neutral-500 text-xs">{email.date}</p>
						</div>
					</div>
				</div>
				<EmailAttachments email={email} />
				<div className="max-w-none">
					<p className="whitespace-pre-wrap text-pretty font-sans text-neutral-900 text-sm leading-6">
						{email.snippet}
					</p>
				</div>
			</div>
		</aside>
	);
}
