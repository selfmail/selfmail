import { Maximize2Icon, Minimize2Icon, XIcon } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { cn } from "#/components/ui";
import {
	panelFullscreenClassName,
	usePanelFullscreen,
} from "#/hooks/use-panel-fullscreen";
import { m } from "#/paraglide/messages";
import {
	AttachmentUpload,
	type ComposeAttachment,
	createAttachment,
} from "../compose/attachments";
import { ComposeEditor } from "../compose/editor";
import { AddressAutocomplete } from "./address-autocomplete";
import { RecipientAutocomplete } from "./recipient-autocomplete";

export interface ComposeSidebarDraft {
	body?: string;
	from?: string;
	subject?: string;
	to?: string;
}

interface ComposeSidebarProps {
	className?: string;
	draft?: ComposeSidebarDraft;
	onClose: () => void;
	workspaceSlug: string;
}

export function ComposeSidebar({
	className,
	draft,
	onClose,
	workspaceSlug,
}: ComposeSidebarProps) {
	const { panelRef, isFullscreen, toggleFullscreen } = usePanelFullscreen();
	const [attachments, setAttachments] = useState<ComposeAttachment[]>([]);
	const [bodyMarkdown, setBodyMarkdown] = useState("");
	const [discardOpen, setDiscardOpen] = useState(false);
	const [showBCC, setShowBCC] = useState(false);
	const [showCC, setShowCC] = useState("false");

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
			ref={panelRef}
			data-panel-fullscreen={isFullscreen || undefined}
			className={cn(
				"sticky top-0 z-10 flex h-dvh w-full shrink-0 flex-col overflow-hidden rounded-l-2xl border-border bg-background",
				className,
				isFullscreen && panelFullscreenClassName,
			)}
		>
			<form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
				<header className="flex items-center justify-between gap-3 border-border border-b px-6 py-4">
					<div className="min-w-0">
						<h2 className="truncate text-balance font-medium text-lg">
							{m["dashboard.compose.title"]()}
						</h2>
					</div>
					<div className="flex shrink-0 items-center gap-2">
						<button
							className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
							aria-pressed={isFullscreen}
							onClick={toggleFullscreen}
							type="button"
						>
							{isFullscreen ? (
								<Minimize2Icon className="size-4" />
							) : (
								<Maximize2Icon className="size-4" />
							)}
							<span>
								{isFullscreen
									? m["dashboard.compose.exit_fullscreen"]()
									: m["dashboard.compose.fullscreen"]()}
							</span>
						</button>
						<button
							aria-label={m["dashboard.compose.close_label"]()}
							className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25"
							onClick={onClose}
							type="button"
						>
							<XIcon className="size-5" />
						</button>
					</div>
				</header>
				<div className="scrollbar-thin flex min-h-0 flex-1 flex-col overflow-y-auto [scrollbar-color:gray_transparent]">
					<div className="flex flex-col">
						<AddressAutocomplete
							defaultValue={draft?.from}
							key={workspaceSlug}
							workspaceSlug={workspaceSlug}
						/>
						<RecipientAutocomplete defaultValue={draft?.to} />
						<textarea
							className="w-full resize-none border-b border-b-border px-4 py-4"
							maxLength={255}
							placeholder={m["dashboard.compose.subject"]()}
						/>
					</div>
					<ComposeEditor
						initialMarkdown={draft?.body}
						onFilesDrop={(files) =>
							setAttachments((current) => [
								...current,
								...files.map(createAttachment),
							])
						}
						onMarkdownChange={setBodyMarkdown}
					/>
					<div className="shrink-0 border-t border-border p-4">
						<AttachmentUpload
							attachments={attachments}
							onAttachmentsChange={setAttachments}
						/>
					</div>
					<textarea
						className="sr-only"
						name="body"
						readOnly
						value={bodyMarkdown}
					/>
				</div>
			</form>
		</aside>
	);
}
