import type { EmailData } from "@/types/email";

interface EmailProps {
	email: EmailData;
	onClick: () => void;
}
export default function Email({ email, onClick }: EmailProps) {
	return (
		<div
			className="cursor-pointer rounded-lg bg-transparent px-2.5 py-5 ring-0 ring-neutral-100 transition-all hover:bg-neutral-100 hover:ring-2"
			onClick={onClick}
		>
			<div className="flex flex-row items-center justify-between">
				<div className="flex flex-row items-center space-x-3">
					{email.unread && <div className="h-1 w-1 rounded-full bg-blue-500" />}
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 font-medium text-sm">
						{email.avatar}
					</div>
					<div className="flex flex-col">
						<div className="flex items-center space-x-2">
							<h2 className={`text-lg ${email.unread ? "font-semibold" : ""}`}>
								{email.from}
							</h2>
							<span className="text-neutral-500 text-sm">{email.date}</span>
						</div>
						<p
							className={`text-neutral-600 ${email.unread ? "font-medium" : ""}`}
						>
							{email.subject}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
