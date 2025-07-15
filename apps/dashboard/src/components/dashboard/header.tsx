import { SettingsIcon } from "lucide-react";

export default function DashboardHeader() {
	return (
		<header className="flex items-center justify-between px-32 py-5">
			<div className="rouded-md flex cursor-pointer flex-row items-center space-x-3 rounded-md bg-transparent ring-neutral-100 transition-all hover:bg-neutral-100 hover:ring-4">
				<img
					src="https://avatars.githubusercontent.com/u/178011817?s=200&v=4"
					alt="Selfmail Logo"
					className="h-5 w-5 rounded-md"
				/>
				<p className="font-medium">Selfmail</p>
			</div>
			<div className="flex items-center space-x-3">
				<SettingsIcon className="h-4 w-4 rounded-md bg-transparent text-neutral-700 transition-colors hover:bg-neutral-100" />
			</div>
		</header>
	);
}
