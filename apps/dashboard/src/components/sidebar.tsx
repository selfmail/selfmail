"use client";

import {
	BellIcon,
	BookmarkIcon,
	CheckIcon,
	ChevronUpDownIcon,
	Cog6ToothIcon,
	HomeIcon,
} from "@heroicons/react/24/outline";
import { Avatar, AvatarFallback, AvatarImage } from "ui/avatar";
import { Button } from "ui/button";
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
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "ui/sidebar";

export default function DashboardSidebar() {
	return (
		<Sidebar className="bg-background ">
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
				<DropdownMenuContent className="w-80 ml-2 rounded-lg">
					<PersonItem checked={true} />
					<PersonItem checked={false} />
					<PersonItem checked={false} />
					<DropdownMenuSeparator />
					<DropdownMenuItem>
						<Cog6ToothIcon className="w-4 h-4" />
						<span>Settings</span>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<BookmarkIcon className="w-4 h-4" />
						<span>Bookmarks</span>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<BellIcon className="w-4 h-4" />
						<span>Updates</span>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<div className="flex flex-row items-center justify-between  rounded-lg px-2 py-1.5">
						<div className="flex flex-col">
							<h2>Free Plan</h2>
							<p className="text-sm text-muted-foreground">
								You are using the free plan
							</p>
						</div>
						<Button size={"sm"}>Upgrade</Button>
					</div>
					<DropdownMenuSeparator />
					<DropdownMenuItem className="cursor-pointer text-red-500 hover:bg-red-200 hover:text-red-500">
						Logout
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Platform</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton>
									<HomeIcon className="w-4 h-4" />
									<span>Home</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton>
									<Cog6ToothIcon className="w-4 h-4" />
									<span>Settings</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
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
