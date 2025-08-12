import { cn } from "@/lib/utils";
import type { EmailData } from "@/types/email";

export default function EmailViewer({
	open,
	selectedEmail,
}: {
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	selectedEmail: EmailData | null;
}) {
	if (!selectedEmail) return null;

	return (
		<div
			className={cn(
				"fixed top-4 right-4 bottom-4 flex w-[calc(50%-32px)] flex-col rounded-xl bg-neutral-100 p-4",
				!open ? "hidden" : "flex",
			)}
		>
			hey
		</div>
	);
}
