import { Maximize2Icon, PaperclipIcon, XIcon } from "lucide-react";
import { cn } from "#/lib/utils";
import { m } from "#/paraglide/messages";
import { useViewedEmail } from "#/stores/viewed-email";
import type { Email } from "./types";

interface EmailAttachmentsProps {
	email: Email;
}

interface EmailPreviewProps {
	className?: string;
	emails: Email[];
	onClose?: () => void;
	selectedEmailId?: string;
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
		<div className="mb-6 rounded-lg border border-border p-4">
			<p className="mb-2 font-medium text-foreground text-sm">
				{formatAttachmentCount(email.attachments)}
			</p>
			<div className="space-y-2">
				{Array.from({ length: email.attachments }, (_, index) => (
					<div
						className="flex items-center gap-2 rounded-md bg-muted px-3 py-2"
						key={`${email.id}-attachment-${index.toString()}`}
					>
						<PaperclipIcon className="size-4 text-muted-foreground" />
						<span className="text-foreground text-sm">
							{m["dashboard.email.attachment_label"]({ number: index + 1 })}
						</span>
						<span className="text-muted-foreground text-xs">
							({m["dashboard.email.attachment_size"]()})
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

export function EmailPreview({
	className,
	emails,
	onClose,
	selectedEmailId,
}: EmailPreviewProps) {
	const { closePreview, emailId } = useViewedEmail();
	const email = emails.find(
		(sampleEmail) => sampleEmail.id === (selectedEmailId ?? emailId),
	);
	const handleClose = onClose ?? closePreview;

	if (!email) {
		return null;
	}

	return (
		<aside
			className={cn(
				"sticky top-0 z-10 hidden h-dvh w-full shrink-0 flex-col overflow-hidden rounded-l-2xl border-border bg-card xl:flex",
				className,
			)}
		>
			<div className="flex items-center justify-between border-border border-b px-6 py-4">
				<h2 className="truncate font-medium text-lg">
					{m["dashboard.email.preview_title"]()}
				</h2>
				<div className="flex items-center gap-2">
					<button
						className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
						type="button"
					>
						<Maximize2Icon className="size-4" />
						<span>{m["dashboard.email.fullscreen"]()}</span>
					</button>
					<button
						aria-label={m["dashboard.email.close_preview"]()}
						className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
						onClick={handleClose}
						type="button"
					>
						<XIcon className="size-5" />
					</button>
				</div>
			</div>
			<div className="flex-1 overflow-y-auto p-6 [scrollbar-color:gray_transparent] [scrollbar-width:thin]">
				<div className="mb-6">
					<h1 className="mb-4 text-balance font-medium text-2xl">
						{email.subject}
					</h1>
					<div className="mb-4 flex items-start gap-3">
						<div className="flex size-12 items-center justify-center rounded-full border border-border bg-muted">
							<span className="font-medium text-muted-foreground">
								{email.initial}
							</span>
						</div>
						<div className="flex-1">
							<p className="font-medium text-foreground">{email.from}</p>
							{email.to ? (
								<p className="text-muted-foreground text-sm">
									{m["dashboard.email.to"]({ address: email.to })}
								</p>
							) : null}
							<p className="text-muted-foreground text-xs">{email.date}</p>
						</div>
					</div>
				</div>
				<EmailAttachments email={email} />
				<div className="max-w-none">
					<p className="whitespace-pre-wrap text-pretty font-sans text-foreground text-sm leading-6">
						{email.snippet}
					</p>
				</div>
			</div>
		</aside>
	);
}
