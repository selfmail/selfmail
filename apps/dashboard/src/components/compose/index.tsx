import { AlertDialog, Dialog } from "@base-ui/react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import {
	buttonVariants,
	cn,
	DiscardButton,
	Input,
	Label,
	SendButton,
} from "#/components/ui";
import AddressSelect from "./address-select";
import { AttachmentUpload, type ComposeAttachment } from "./attachments";
import { ComposeEditor } from "./editor";
import { composeDialogHandle } from "./handle";
import { ToInput } from "./to-input";

export default function ComposeDialog({
	workspaceSlug,
}: {
	workspaceSlug: string;
}) {
	const [open, setOpen] = useState(false);
	const [attachments, setAttachments] = useState<ComposeAttachment[]>([]);
	const [bodyMarkdown, setBodyMarkdown] = useState("");
	const [discardOpen, setDiscardOpen] = useState(false);
	const [triggerId, setTriggerId] = useState<string | null>(null);

	useEffect(() => {
		if (open) {
			document.title = "Compose new Email - Selfmail";
		} else {
			document.title = "Selfmail";
		}
	}, [open]);
	const handleOpenChange = (
		isOpen: boolean,
		eventDetails: Dialog.Root.ChangeEventDetails,
	) => {
		setOpen(isOpen);
		setTriggerId(eventDetails.trigger?.id ?? null);

		if (!isOpen) {
			setAttachments([]);
			setBodyMarkdown("");
			setDiscardOpen(false);
		}
	};

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		composeDialogHandle.close();
	};

	const handleDiscard = () => {
		setAttachments([]);
		setBodyMarkdown("");
		setDiscardOpen(false);
		composeDialogHandle.close();
	};

	return (
		<Dialog.Root
			handle={composeDialogHandle}
			onOpenChange={handleOpenChange}
			open={open}
			triggerId={triggerId}
		>
			{({ payload }) => (
				<Dialog.Portal>
					<Dialog.Backdrop className="fixed inset-0 z-50 bg-black/30" />
					<Dialog.Viewport className="fixed inset-0 z-50 flex items-end justify-center px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center sm:p-6">
						<Dialog.Popup className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border bg-background text-foreground shadow-xl outline-none">
							<form
								className="flex min-h-0 flex-1 flex-col"
								onSubmit={handleSubmit}
							>
								<header className="flex items-start justify-between gap-4 border-border border-b p-5">
									<div>
										<Dialog.Title className="text-balance font-medium text-xl">
											Compose email
										</Dialog.Title>
										<Dialog.Description className="text-muted-foreground text-sm text-pretty">
											Draft a message with Markdown formatting and attachments.
										</Dialog.Description>
									</div>
								</header>
								<div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
									<div className="grid gap-3">
										<AddressSelect
											defaultValue={payload?.from}
											workspaceSlug={workspaceSlug}
										/>
										<ToInput defaultValue={payload?.to} />
										<div className="grid gap-2 sm:grid-cols-[4.5rem_1fr] sm:items-center">
											<Label
												className="text-muted-foreground"
												htmlFor="compose-subject"
											>
												Subject
											</Label>
											<Input
												className="h-10 rounded-lg border-0 bg-muted px-3 text-sm"
												defaultValue={payload?.subject}
												id="compose-subject"
												name="subject"
												placeholder="Subject"
											/>
										</div>
									</div>
									<ComposeEditor
										initialMarkdown={payload?.body}
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
								<footer className="flex flex-col-reverse gap-2 border-border border-t bg-muted p-4 sm:flex-row sm:items-center sm:justify-between">
									<DiscardButton
										className="justify-center rounded-lg"
										onClick={() => setDiscardOpen(true)}
										type="button"
									/>
									<div className="flex items-center justify-end gap-2">
										<Dialog.Close
											className={cn(
												buttonVariants({ variant: "ghost" }),
												"rounded-lg",
											)}
											type="button"
										>
											Close
										</Dialog.Close>
										<SendButton className="rounded-lg" type="submit" />
									</div>
								</footer>
							</form>
							<AlertDialog.Root
								onOpenChange={setDiscardOpen}
								open={discardOpen}
							>
								<AlertDialog.Portal>
									<AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/40" />
									<AlertDialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
										<AlertDialog.Popup className="grid w-full max-w-sm gap-5 rounded-xl border border-border bg-background p-5 text-foreground shadow-xl outline-none">
											<div className="grid gap-2">
												<AlertDialog.Title className="text-balance font-medium text-xl">
													Discard draft?
												</AlertDialog.Title>
												<AlertDialog.Description className="text-muted-foreground text-pretty text-sm">
													This clears the message, recipients, subject, and
													attachments.
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
						</Dialog.Popup>
					</Dialog.Viewport>
				</Dialog.Portal>
			)}
		</Dialog.Root>
	);
}
