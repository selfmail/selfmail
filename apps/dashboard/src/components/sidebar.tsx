"use client";

import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { Avatar, AvatarFallback, AvatarImage } from "ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "ui/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "ui/sidebar";

export default function DashboardSidebar() {
	return (
		<Sidebar className="w-64 bg-background ">
			{/* Sidebar Header */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<SidebarHeader className="border-b cursor-pointer p-5 h-14 flex flex-row items-center justify-between">
						<div className="flex items-center gap-3">
							<Avatar className="rounded-full h-8 w-8">
								<AvatarImage
									className="rounded-full"
									src="https://github.com/i-am-henri.png"
								/>
								<AvatarFallback>HN</AvatarFallback>
							</Avatar>
							<h2>henri</h2>
						</div>
						<ChevronUpDownIcon className="w-4 h-4" />
					</SidebarHeader>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-64 ml-2 rounded-lg">
					<PersonItem checked={true} />
					<PersonItem checked={false} />
					<PersonItem checked={false} />
					<DropdownMenuSeparator />
					<DropdownMenuItem>Settings</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<SidebarContent>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton>Settings</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton>Bookmarks</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton>Updates</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton>Upgrade</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarContent>
		</Sidebar>
	);
}

// components for the sidebar dropdown menu

function PersonItem({ checked }: { checked: boolean }) {
	return (
		<div className="flex flex-row cursor-pointer items-center justify-between px-2 py-1.5 hover:bg-accent rounded-lg">
			<div className="flex items-center gap-3">
				<Avatar className="rounded-full h-7 w-7">
					<AvatarImage src="https://github.com/i-am-henri.png" />
					<AvatarFallback>HN</AvatarFallback>
				</Avatar>
				<h2>henri</h2>
			</div>
			{checked && <CheckIcon className="w-4 h-4" />}
		</div>
	);
}
