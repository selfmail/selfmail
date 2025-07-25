import { PlusIcon, SettingsIcon } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export default function DashboardHeader() {
	return (
		<header className="flex items-center justify-between px-32 py-5">
			<DropdownMenu>
				<DropdownMenuTrigger>
					<div className="rouded-md flex cursor-pointer flex-row items-center space-x-3 rounded-md bg-transparent outline-none ring-neutral-100 transition-all hover:bg-neutral-100 hover:ring-4">
						<img
							src="https://avatars.githubusercontent.com/u/178011817?s=200&v=4"
							alt="Selfmail Logo"
							className="h-5 w-5 rounded-md"
						/>
						<p className="font-medium">Selfmail</p>
					</div>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<div
						className={
							"flex cursor-default flex-row justify-between p-2 hover:bg-transparent"
						}
					>
						<div className="flex flex-row items-center justify-start space-x-3">
							<div className="flex h-6 w-6 items-center justify-center rounded-md bg-white ring-2 ring-white ring-offset-2 ring-offset-neutral-100">
								SE
							</div>
							<div className="flex h-6 w-6 items-center justify-center rounded-md bg-white ring-2 ring-white">
								SE
							</div>
							<div className="flex h-6 w-6 items-center justify-center rounded-md bg-white ring-2 ring-white">
								SE
							</div>
						</div>
						<PlusIcon className="h-4 w-4 cursor-pointer rounded-sm ring-0 ring-neutral-200 transition hover:bg-neutral-200 hover:ring-2" />
					</div>
					<DropdownMenuItem>Settings</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<div className="flex items-center space-x-3">
				<SettingsIcon className="h-4 w-4 rounded-md bg-transparent text-neutral-700 transition-colors hover:bg-neutral-100" />
			</div>
		</header>
	);
}
