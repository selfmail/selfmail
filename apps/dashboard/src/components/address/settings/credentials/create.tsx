import { InfoIcon, PlusIcon } from "lucide-react";
import {
	Button,
	Dialog,
	DialogContent,
	DialogOverlay,
	DialogTrigger,
	Input,
} from "ui";

export default function CreateCredentials({
	workspaceId,
	addressId,
}: {
	workspaceId: string;
	addressId: string;
}) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<button
					type="button"
					className="flex cursor-pointer items-center space-x-2"
				>
					<PlusIcon className="h-4 w-4 text-neutral-600" />
					<span className="font-medium text-neutral-600 text-sm">
						Create new Credentials
					</span>
				</button>
			</DialogTrigger>
			<DialogContent className="border-none bg-neutral-100 outline-none ring-2 ring-neutral-100">
				<form className="flex flex-col space-y-4 p-4">
					<h2 className="text-">Create new Credentials</h2>
					<Input
						type="text"
						className="bg-neutral-200"
						placeholder="Credential Name"
					/>
					<div className="flex flex-row items-center space-x-1">
						<InfoIcon className="h-4 w-4 text-neutral-500" />
						<p>A password for your credential is getting random generated.</p>
					</div>
					<Button variant={"default"} type="submit">
						Create
					</Button>
				</form>
			</DialogContent>
			<DialogOverlay className="bg-black/10" />
		</Dialog>
	);
}
