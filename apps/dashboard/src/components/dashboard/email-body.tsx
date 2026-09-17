import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { emailHtmlDocument } from "#/lib/email-html-document";
import { getDashboardEmailFn } from "#/lib/workspaces";
import { m } from "#/paraglide/messages";
import type { Email } from "./types";

interface EmailBodyProps {
	email: Email;
}

const buttonClassName =
	"rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring";

export function EmailBody({ email }: EmailBodyProps) {
	const [loadImages, setLoadImages] = useState(false);
	const [plainText, setPlainText] = useState(false);
	const detail = useQuery({
		queryKey: ["email-body", email.id],
		queryFn: () => getDashboardEmailFn({ data: { emailId: email.id } }),
		enabled: email.html === undefined,
		retry: false,
	});
	const body = email.html === undefined ? detail.data : email;
	const html = body?.html;

	return (
		<div className="space-y-3">
			{email.html === undefined && detail.isPending ? (
				<output className="block text-muted-foreground text-sm">
					{m["dashboard.email.loading_body"]()}
				</output>
			) : null}
			{email.html === undefined && detail.isError ? (
				<div className="space-y-2">
					<p className="text-destructive text-sm" role="alert">
						{m["dashboard.email.body_error"]()}
					</p>
					<button
						className={buttonClassName}
						onClick={() => detail.refetch()}
						type="button"
					>
						{m["dashboard.email.retry_body"]()}
					</button>
				</div>
			) : null}
			{html ? (
				<div className="flex flex-wrap items-center gap-2">
					<button
						aria-pressed={plainText}
						className={buttonClassName}
						onClick={() => setPlainText(!plainText)}
						type="button"
					>
						{plainText
							? m["dashboard.email.show_html"]()
							: m["dashboard.email.show_text"]()}
					</button>
					{plainText || loadImages ? null : (
						<>
							<button
								className={buttonClassName}
								onClick={() => setLoadImages(true)}
								type="button"
							>
								{m["dashboard.email.load_images"]()}
							</button>
							<p className="w-full text-muted-foreground text-xs">
								{m["dashboard.email.images_notice"]()}
							</p>
						</>
					)}
				</div>
			) : null}
			{html && !plainText ? (
				<iframe
					className="h-[65dvh] min-h-80 w-full rounded-md border border-border bg-white"
					referrerPolicy="no-referrer"
					sandbox="allow-popups allow-popups-to-escape-sandbox"
					srcDoc={emailHtmlDocument(html, loadImages)}
					title={email.subject}
				/>
			) : (
				<p className="whitespace-pre-wrap text-pretty font-sans text-foreground text-sm leading-6">
					{body?.snippet ?? email.snippet}
				</p>
			)}
		</div>
	);
}
