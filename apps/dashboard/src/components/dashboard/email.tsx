import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import type { EmailData } from "@/types/email";

interface EmailProps {
	email: EmailData;
	onClick: () => void;
}

const Email = forwardRef<HTMLButtonElement, EmailProps>(
	({ email, onClick }, ref) => {
		return (
			<button
				ref={ref}
				type="button"
				className={cn(
					"group flex flex-row justify-between p-4 px-32 hover:bg-gray-100",
					email?.unread ? "pl-28" : "pl-32",
				)}
				onClick={onClick}
			>
				<div className="flex flex-row items-center">
					{email?.unread && (
						<span className="mr-2 h-2 w-2 rounded-full bg-blue-300" />
					)}
					<div className="mr-2 flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-neutral-200">
						{email.avatar}
					</div>
					<div className="relative flex w-36 items-center justify-start overflow-hidden px-2">
						<span className="">{email.from}</span>
						<div className="pointer-events-none absolute top-0 right-0 h-full w-7 bg-gradient-to-r from-transparent to-white group-hover:to-gray-100" />
					</div>
					<div className="flex flex-1 items-center justify-start overflow-hidden px-2">
						{email.subject}
					</div>
				</div>
				<span>{new Date(email.date).toLocaleTimeString("de-DE")}</span>
			</button>
		);
	},
);

Email.displayName = "Email";

export default Email;
