import { useEmailDetails } from "@/hooks/useEmailDetails";
import { cn } from "@/lib/utils";
import type { EmailData } from "@/types/email";

export default function EmailViewer({
	open,
	setOpen,
	selectedEmail,
	workspaceId,
}: {
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	selectedEmail: EmailData | null;
	workspaceId: string;
}) {
	const {
		data: emailDetails,
		isLoading,
		error,
	} = useEmailDetails(selectedEmail?.id || "", workspaceId);

	if (!selectedEmail) return null;

	return (
		<div
			className={cn(
				"fixed top-4 right-4 bottom-4 flex w-[calc(50%-32px)] flex-col overflow-hidden rounded-xl bg-neutral-100 p-4",
				!open ? "hidden" : "flex",
			)}
		>
			<div className="flex h-full flex-col">
				{/* Header */}
				<div className="mb-4 border-neutral-200 border-b pb-4">
					<div className="mb-2 flex items-start justify-between">
						<h2 className="flex-1 pr-4 font-semibold text-neutral-900 text-xl">
							{emailDetails?.subject || selectedEmail.subject}
						</h2>
						<button
							onClick={() => setOpen(false)}
							className="flex-shrink-0 cursor-pointer p-1 text-neutral-400 transition-colors hover:text-neutral-600"
							aria-label="Close email"
						>
							<svg
								className="h-5 w-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>
					<div className="text-neutral-600 text-sm">
						<p className="mb-1">
							<span className="font-medium">From:</span>{" "}
							{emailDetails?.contact?.email ?? selectedEmail.from}
						</p>
						<p>
							<span className="font-medium">Date:</span>{" "}
							{new Date(selectedEmail.date).toLocaleString()}
						</p>
					</div>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto">
					{isLoading ? (
						<div className="flex h-32 items-center justify-center">
							<div className="text-neutral-500">Loading email content...</div>
						</div>
					) : error ? (
						<div className="rounded-lg border border-red-200 bg-red-50 p-4">
							<p className="text-red-600">Failed to load email content</p>
						</div>
					) : emailDetails ? (
						<div className="space-y-4">
							{/* Show HTML content if available */}
							{emailDetails.html ? (
								<div className="space-y-4">
									<div className="rounded-lg border border-neutral-200 bg-white p-4">
										<div
											className="prose prose-sm max-w-none"
											dangerouslySetInnerHTML={{ __html: emailDetails.html }}
										/>
									</div>
									{emailDetails.text && (
										<div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
											<pre className="whitespace-pre-wrap font-mono text-neutral-700 text-sm">
												{emailDetails.text}
											</pre>
										</div>
									)}
								</div>
							) : (
								/* Show plain text content */
								<div className="rounded-lg border border-neutral-200 bg-white p-4">
									<pre className="whitespace-pre-wrap text-neutral-700 text-sm">
										{emailDetails.text || selectedEmail.content}
									</pre>
								</div>
							)}
						</div>
					) : (
						<div className="rounded-lg border border-neutral-200 bg-white p-4">
							<pre className="whitespace-pre-wrap text-neutral-700 text-sm">
								{selectedEmail.content}
							</pre>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
