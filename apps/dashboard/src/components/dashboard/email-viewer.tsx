import { cn } from "@/lib/utils";
import type { EmailData } from "@/types/email";
import { useEmailDetails } from "@/hooks/useEmailDetails";

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

	const { data: emailDetails, isLoading, error } = useEmailDetails(selectedEmail?.id || "", workspaceId);

	if (!selectedEmail) return null;

	return (
		<div
			className={cn(
				"fixed top-4 right-4 bottom-4 flex w-[calc(50%-32px)] flex-col rounded-xl bg-neutral-100 p-4 overflow-hidden",
				!open ? "hidden" : "flex",
			)}
		>
			<div className="flex flex-col h-full">
				{/* Header */}
				<div className="border-b border-neutral-200 pb-4 mb-4">
					<div className="flex items-start justify-between mb-2">
						<h2 className="text-xl font-semibold text-neutral-900 flex-1 pr-4">
							{emailDetails?.subject || selectedEmail.subject}
						</h2>
						<button
							onClick={() => setOpen(false)}
							className="flex-shrink-0 cursor-pointer p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
							aria-label="Close email"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
					<div className="text-sm text-neutral-600">
						<p className="mb-1">
							<span className="font-medium">From:</span> {emailDetails?.contact?.email ?? selectedEmail.from}
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
						<div className="flex items-center justify-center h-32">
							<div className="text-neutral-500">Loading email content...</div>
						</div>
					) : error ? (
						<div className="bg-red-50 border border-red-200 rounded-lg p-4">
							<p className="text-red-600">Failed to load email content</p>
						</div>
					) : emailDetails ? (
						<div className="space-y-4">
							{/* Show HTML content if available */}
							{emailDetails.html ? (
								<div className="space-y-4">
									<div className="bg-white border border-neutral-200 rounded-lg p-4">
										<div
											className="prose prose-sm max-w-none"
											dangerouslySetInnerHTML={{ __html: emailDetails.html }}
										/>
									</div>
									{emailDetails.text && (
										<div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
											<pre className="whitespace-pre-wrap text-sm text-neutral-700 font-mono">
												{emailDetails.text}
											</pre>
										</div>
									)}
								</div>
							) : (
								/* Show plain text content */
								<div className="bg-white border border-neutral-200 rounded-lg p-4">
									<pre className="whitespace-pre-wrap text-sm text-neutral-700">
										{emailDetails.text || selectedEmail.content}
									</pre>
								</div>
							)}
						</div>
					) : (
						<div className="bg-white border border-neutral-200 rounded-lg p-4">
							<pre className="whitespace-pre-wrap text-sm text-neutral-700">
								{selectedEmail.content}
							</pre>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
