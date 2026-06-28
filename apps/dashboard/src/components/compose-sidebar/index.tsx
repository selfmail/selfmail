import { AlertDialog } from "@base-ui/react";
import { Maximize2Icon, XIcon } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import {
	buttonVariants,
	cn,
	DiscardButton,
	Input,
	Label,
	SendButton,
} from "#/components/ui";
import AddressSelect from "../compose/address-select";
import {
	AttachmentUpload,
	type ComposeAttachment,
} from "../compose/attachments";
import { ComposeEditor } from "../compose/editor";
import { ToInput } from "../compose/to-input";

export type ComposeSidebarDraft = {
	body?: string;
	from?: string;
	subject?: string;
	to?: string;
};

type ComposeSidebarProps = {
	className?: string;
	draft?: ComposeSidebarDraft;
	onClose: () => void;
	workspaceSlug: string;
};

export function ComposeSidebar({
	className,
	draft,
	onClose,
	workspaceSlug,
}: ComposeSidebarProps) {
	const [attachments, setAttachments] = useState<ComposeAttachment[]>([]);
	const [bodyMarkdown, setBodyMarkdown] = useState("");
	const [discardOpen, setDiscardOpen] = useState(false);

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		onClose();
	};

	const handleDiscard = () => {
		setAttachments([]);
		setBodyMarkdown("");
		setDiscardOpen(false);
		onClose();
	};

	return (
		<aside
			className={cn(
				"sticky top-0 z-10 flex h-dvh w-full shrink-0 flex-col overflow-hidden rounded-l-2xl border-border bg-background",
				className,
			)}
		>
			<form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
				<header className="flex items-center justify-between gap-3 border-border border-b px-6 py-4">
					<div className="min-w-0">
						<h2 className="truncate font-medium text-lg text-balance">
							Compose email
						</h2>
						<p className="truncate text-muted-foreground text-sm text-pretty">
							Draft a message with Markdown formatting.
						</p>
					</div>
					<div className="flex shrink-0 items-center gap-2">
						<button
							className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
							type="button"
						>
							<Maximize2Icon className="size-4" />
							<span>Fullscreen</span>
						</button>
						<button
							aria-label="Close compose"
							className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25"
							onClick={onClose}
							type="button"
						>
							<XIcon className="size-5" />
						</button>
					</div>
				</header>
				<div className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6 [scrollbar-color:gray_transparent]">
					<div className="grid gap-3">
						<AddressSelect
							defaultValue={draft?.from}
							workspaceSlug={workspaceSlug}
						/>
						<ToInput defaultValue={draft?.to} />
						<div className="grid gap-2 sm:grid-cols-[4.5rem_1fr] sm:items-center">
							<Label
								className="text-muted-foreground"
								htmlFor="compose-sidebar-subject"
							>
								Subject
							</Label>
							<Input
								className="h-10 rounded-lg border-0 bg-muted px-3 text-sm"
								defaultValue={draft?.subject}
								id="compose-sidebar-subject"
								name="subject"
								placeholder="Subject"
							/>
						</div>
					</div>
					<ComposeEditor
						initialMarkdown={draft?.body}
						onMarkdownChange={setBodyMarkdown}
					/>
					<textarea
						className="sr-only"
						name="body"
						readOnly
						value={bodyMarkdown}
					/>
					<AttachmentUpload
						attachments={attachments}
						onAttachmentsChange={setAttachments}
					/>
				</div>
				<footer className="flex flex-col-reverse gap-2 border-border border-t p-4 sm:flex-row sm:items-center sm:justify-between">
					<DiscardButton
						className="justify-center rounded-lg"
						onClick={() => setDiscardOpen(true)}
						type="button"
					/>
					<div className="flex items-center justify-end gap-2">
						<button
							className={cn(buttonVariants({ variant: "ghost" }), "rounded-lg")}
							onClick={onClose}
							type="button"
						>
							Close
						</button>
						<SendButton className="rounded-lg" type="submit" />
					</div>
				</footer>
			</form>
			<AlertDialog.Root onOpenChange={setDiscardOpen} open={discardOpen}>
				<AlertDialog.Portal>
					<AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/40" />
					<AlertDialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
						<AlertDialog.Popup className="grid w-full max-w-sm gap-5 rounded-xl border border-border bg-background p-5 text-foreground shadow-xl outline-none">
							<div className="grid gap-2">
								<AlertDialog.Title className="text-balance font-medium text-xl">
									Discard draft?
								</AlertDialog.Title>
								<AlertDialog.Description className="text-muted-foreground text-pretty text-sm">
									This clears the message, recipients, subject, and attachments.
								</AlertDialog.Description>
							</div>
							<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
								<AlertDialog.Close
									className={cn(
										buttonVariants({ variant: "outline" }),
										"rounded-lg",
									)}
									type="button"
								>
									Keep editing
								</AlertDialog.Close>
								<AlertDialog.Close
									className={cn(
										buttonVariants({ variant: "destructive" }),
										"rounded-lg",
									)}
									onClick={handleDiscard}
									type="button"
								>
									Discard draft
								</AlertDialog.Close>
							</div>
						</AlertDialog.Popup>
					</AlertDialog.Viewport>
				</AlertDialog.Portal>
			</AlertDialog.Root>
		</aside>
	);
}
