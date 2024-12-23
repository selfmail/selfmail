"use client";

import {
	AtSymbolIcon,
	BellIcon,
	BookmarkIcon,
	ChartBarIcon,
	CheckIcon,
	ChevronUpDownIcon,
	Cog6ToothIcon,
	CreditCardIcon,
	HomeIcon,
	InboxIcon,
	PencilIcon,
} from "@heroicons/react/24/solid";
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
	SidebarFooter,
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
						<ChartBarIcon className="w-4 h-4" />
						<span>Analytics</span>
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
							<SidebarMenuItem>
								<SidebarMenuButton>
									<BellIcon className="w-4 h-4" />
									<span>Updates</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupLabel>Emails</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton>
									<InboxIcon className="w-4 h-4" />
									<span>Inbox</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton>
									<AtSymbolIcon className="w-4 h-4" />
									<span>Adresses</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton>
									<PencilIcon className="w-4 h-4" />
									<span>Editor</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter className="p-5 flex flex-row items-center border-t border-border justify-between">
				<div className="flex flex-col">
					<div className="flex items-center  space-x-1">
						<CreditCardIcon className="w-4 h-4" />
						<h2>Free Plan</h2>
					</div>
					<p className="text-sm text-muted-foreground">0€ / month</p>
				</div>
				<Button size={"sm"}>Upgrade</Button>
			</SidebarFooter>
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
