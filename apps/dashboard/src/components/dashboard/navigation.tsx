import { NavLink } from "./nav-link";

export default function DashboardNavigation() {
	return (
		<div className="flex w-full flex-row items-start justify-between px-32 py-5">
			<div className="flex flex-col space-y-2">
				<p className="font-medium">Mail</p>
				<NavLink href="/">Inbox</NavLink>
				<NavLink href="/">henri@selfmail.app</NavLink>
				<NavLink href="/">support@selfmail.app</NavLink>
				<div className="flex w-min flex-row items-center space-x-0.5 rounded-md bg-transparent p-2 ring-neutral-100 transition-all hover:bg-neutral-100 hover:ring-4">
					<span className="h-1 w-1 rounded-full bg-neutral-600" />
					<span className="h-1 w-1 rounded-full bg-neutral-600" />
					<span className="h-1 w-1 rounded-full bg-neutral-600" />
				</div>
			</div>
			<div className="flex flex-col space-y-2">
				<p className="font-medium">Workspace</p>
				<NavLink href="/workflows">Workflows</NavLink>
				<NavLink href="/members">Members</NavLink>
			</div>
			<div className="flex flex-col space-y-2">
				<p className="font-medium">Settings</p>
				<NavLink href="/settings/workspace">Workspace Settings</NavLink>
				<NavLink href="/settings/profile">Profile Settings</NavLink>
				<NavLink href="/settings/user">User Settings</NavLink>
				<div className="flex w-min flex-row items-center space-x-0.5 rounded-md bg-transparent p-2 ring-neutral-100 transition-all hover:bg-neutral-100 hover:ring-4">
					<span className="h-1 w-1 rounded-full bg-neutral-600" />
					<span className="h-1 w-1 rounded-full bg-neutral-600" />
					<span className="h-1 w-1 rounded-full bg-neutral-600" />
				</div>
			</div>
		</div>
	);
}
