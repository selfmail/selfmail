import * as Avatar from "@radix-ui/react-avatar";
import * as Checkbox from "@radix-ui/react-checkbox";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Label from "@radix-ui/react-label";
import * as Tooltip from "@radix-ui/react-tooltip";
import { createFileRoute } from "@tanstack/react-router";
import {
	AlertCircle,
	Archive,
	Bell,
	Check,
	ChevronDown,
	Clock,
	Filter,
	Inbox,
	LogOut,
	Mail,
	MoreHorizontal,
	Paperclip,
	Plus,
	RefreshCw,
	Search,
	Send,
	Settings,
	Shield,
	Star,
	Tag,
	Trash2,
	User,
	X,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
	component: App,
});

// Mock email data
const emails = [
	{
		id: 1,
		from: "github@github.com",
		fromName: "GitHub",
		subject: "Your weekly digest",
		preview: "Here's what happened in your repositories this week...",
		time: "2m",
		isRead: false,
		isStarred: true,
		hasAttachment: false,
		priority: "normal",
	},
	{
		id: 2,
		from: "support@linear.app",
		fromName: "Linear",
		subject: "Issue updated: Fix navigation bug",
		preview: "John Doe has updated the issue and assigned it to you...",
		time: "1h",
		isRead: false,
		isStarred: false,
		hasAttachment: true,
		priority: "high",
	},
	{
		id: 3,
		from: "noreply@stripe.com",
		fromName: "Stripe",
		subject: "Payment successful",
		preview: "Your payment of $29.00 has been processed successfully...",
		time: "3h",
		isRead: true,
		isStarred: false,
		hasAttachment: false,
		priority: "normal",
	},
	{
		id: 4,
		from: "team@vercel.com",
		fromName: "Vercel",
		subject: "Deployment successful",
		preview: "Your deployment to production was successful. View your app...",
		time: "5h",
		isRead: true,
		isStarred: false,
		hasAttachment: false,
		priority: "normal",
	},
	{
		id: 5,
		from: "security@selfmail.com",
		fromName: "Selfmail Security",
		subject: "New login from unknown device",
		preview:
			"We detected a new login to your account from an unknown device...",
		time: "1d",
		isRead: false,
		isStarred: false,
		hasAttachment: false,
		priority: "high",
	},
];

function App() {
	const [selectedEmailId, setSelectedEmailId] = useState<number | null>(null);
	const [sidePanelOpen, setSidePanelOpen] = useState(false);

	const selectedEmail = selectedEmailId
		? emails.find((e) => e.id === selectedEmailId)
		: null;

	const openEmailDetails = (emailId: number) => {
		setSelectedEmailId(emailId);
		setSidePanelOpen(true);
	};

	const closeSidePanel = () => {
		setSidePanelOpen(false);
		setSelectedEmailId(null);
	};

	return (
		<Tooltip.Provider>
			<div className="min-h-screen bg-neutral-950 p-4">
				{/* Top Controls Bar */}
				<div className="mb-4 flex items-center justify-between">
					<div className="flex items-center gap-4">
						{/* Dashboard Title */}
						<div className="flex items-center gap-2">
							<div className="flex h-6 w-6 items-center justify-center rounded bg-neutral-300">
								<span className="font-bold text-neutral-900 text-sm">S</span>
							</div>
							<h1 className="font-semibold text-lg text-white">
								Selfmail Dashboard
							</h1>
						</div>

						{/* View Controls */}
						<div className="flex items-center gap-2">
							<button
								type="button"
								className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-white transition-colors hover:bg-neutral-700"
							>
								Inbox
							</button>
							<button
								type="button"
								className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-neutral-400 text-sm transition-colors hover:bg-neutral-800 hover:text-white"
							>
								Today
							</button>
							<button
								type="button"
								className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-neutral-400 text-sm transition-colors hover:bg-neutral-800 hover:text-white"
							>
								Filter
							</button>
						</div>
					</div>

					{/* Top Right Controls */}
					<div className="flex items-center gap-2">
						<button
							type="button"
							className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-neutral-400 text-sm transition-colors hover:bg-neutral-800 hover:text-white"
						>
							Settings
						</button>
						<DropdownMenu.Root>
							<DropdownMenu.Trigger asChild>
								<button
									type="button"
									className="flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-neutral-400 text-sm transition-colors hover:bg-neutral-800 hover:text-white"
								>
									<Avatar.Root className="inline-flex h-5 w-5 select-none items-center justify-center overflow-hidden rounded-full bg-neutral-600">
										<Avatar.Fallback className="flex h-full w-full items-center justify-center bg-blue-600 font-medium text-white text-xs">
											U
										</Avatar.Fallback>
									</Avatar.Root>
									Account
									<ChevronDown className="h-3 w-3" />
								</button>
							</DropdownMenu.Trigger>
							<DropdownMenu.Portal>
								<DropdownMenu.Content
									className="min-w-[180px] rounded-md border border-neutral-700 bg-neutral-800 p-1 shadow-lg"
									sideOffset={5}
								>
									<DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-white hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none">
										<User className="h-3 w-3" />
										Profile
									</DropdownMenu.Item>
									<DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-white hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none">
										<Settings className="h-3 w-3" />
										Settings
									</DropdownMenu.Item>
									<DropdownMenu.Separator className="my-1 h-px bg-neutral-600" />
									<DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-red-400 text-sm hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none">
										<LogOut className="h-3 w-3" />
										Sign Out
									</DropdownMenu.Item>
								</DropdownMenu.Content>
							</DropdownMenu.Portal>
						</DropdownMenu.Root>
					</div>
				</div>

				{/* Main Content Layout */}
				<div className="flex gap-4">
					{/* Sidebar - No background, just the content */}
					<div className="flex h-[calc(100vh-8rem)] w-56 flex-col rounded-xl border border-neutral-700 bg-neutral-800 shadow-lg">
						{/* Logo */}
						<div className="flex h-10 items-center justify-between px-3">
							<div className="flex items-center gap-2">
								<div className="flex h-5 w-5 items-center justify-center rounded bg-neutral-300">
									<span className="font-bold text-neutral-900 text-xs">S</span>
								</div>
								<h1 className="font-medium text-sm text-white">Selfmail</h1>
							</div>

							{/* Settings Dropdown */}
							<DropdownMenu.Root>
								<DropdownMenu.Trigger asChild>
									<button
										type="button"
										className="rounded p-1 transition-colors hover:bg-neutral-700"
									>
										<Settings className="h-3 w-3 text-neutral-400" />
									</button>
								</DropdownMenu.Trigger>
								<DropdownMenu.Portal>
									<DropdownMenu.Content
										className="min-w-[200px] rounded-md border border-neutral-600 bg-neutral-800 p-1 shadow-lg"
										sideOffset={5}
									>
										<DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-white hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none">
											<User className="h-3 w-3" />
											Account Settings
										</DropdownMenu.Item>
										<DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-white hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none">
											<Bell className="h-3 w-3" />
											Notifications
										</DropdownMenu.Item>
										<DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-white hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none">
											<Shield className="h-3 w-3" />
											Privacy & Security
										</DropdownMenu.Item>
										<DropdownMenu.Separator className="my-1 h-px bg-neutral-600" />
										<DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-red-400 text-sm hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none">
											<LogOut className="h-3 w-3" />
											Sign Out
										</DropdownMenu.Item>
									</DropdownMenu.Content>
								</DropdownMenu.Portal>
							</DropdownMenu.Root>
						</div>

						{/* Organization Selector */}
						<div className="mx-3 mt-1 mb-2">
							<DropdownMenu.Root>
								<DropdownMenu.Trigger asChild>
									<button
										type="button"
										className="flex w-full items-center gap-2 rounded border border-neutral-600 bg-neutral-700/50 px-2 py-1.5 text-left text-sm text-white transition-colors hover:bg-neutral-700"
									>
										<Avatar.Root className="inline-flex h-6 w-6 select-none items-center justify-center overflow-hidden rounded-full bg-neutral-600">
											<Avatar.Image
												className="h-full w-full rounded-full object-cover"
												src=""
												alt="Organization"
											/>
											<Avatar.Fallback className="flex h-full w-full items-center justify-center bg-blue-600 font-medium text-white text-xs">
												AC
											</Avatar.Fallback>
										</Avatar.Root>
										<div className="min-w-0 flex-1">
											<div className="font-medium text-white text-xs">
												Acme Corp
											</div>
											<div className="truncate text-neutral-400 text-xs">
												acme@selfmail.com
											</div>
										</div>
										<ChevronDown className="h-3 w-3 text-neutral-400" />
									</button>
								</DropdownMenu.Trigger>
								<DropdownMenu.Portal>
									<DropdownMenu.Content
										className="min-w-[240px] rounded-md border border-neutral-600 bg-neutral-800 p-2 shadow-lg"
										sideOffset={5}
									>
										<div className="mb-2">
											<Label.Root className="font-medium text-neutral-400 text-xs uppercase tracking-wide">
												Organizations
											</Label.Root>
										</div>

										{/* Current Organization */}
										<DropdownMenu.Item className="mb-1 flex cursor-pointer items-center gap-2 rounded bg-neutral-700/50 px-2 py-2 text-sm text-white hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none">
											<Avatar.Root className="inline-flex h-7 w-7 select-none items-center justify-center overflow-hidden rounded-full bg-neutral-600">
												<Avatar.Fallback className="flex h-full w-full items-center justify-center bg-blue-600 font-medium text-white text-xs">
													AC
												</Avatar.Fallback>
											</Avatar.Root>
											<div className="min-w-0 flex-1">
												<div className="font-medium text-sm text-white">
													Acme Corp
												</div>
												<div className="text-neutral-400 text-xs">
													acme@selfmail.com
												</div>
											</div>
											<Check className="h-3 w-3 text-blue-400" />
										</DropdownMenu.Item>

										{/* Other Organizations */}
										<DropdownMenu.Item className="mb-1 flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm text-white hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none">
											<Avatar.Root className="inline-flex h-7 w-7 select-none items-center justify-center overflow-hidden rounded-full bg-neutral-600">
												<Avatar.Fallback className="flex h-full w-full items-center justify-center bg-green-600 font-medium text-white text-xs">
													TC
												</Avatar.Fallback>
											</Avatar.Root>
											<div className="min-w-0 flex-1">
												<div className="font-medium text-sm text-white">
													TechCorp
												</div>
												<div className="text-neutral-400 text-xs">
													tech@selfmail.com
												</div>
											</div>
										</DropdownMenu.Item>

										<DropdownMenu.Item className="mb-1 flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm text-white hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none">
											<Avatar.Root className="inline-flex h-7 w-7 select-none items-center justify-center overflow-hidden rounded-full bg-neutral-600">
												<Avatar.Fallback className="flex h-full w-full items-center justify-center bg-purple-600 font-medium text-white text-xs">
													DS
												</Avatar.Fallback>
											</Avatar.Root>
											<div className="min-w-0 flex-1">
												<div className="font-medium text-sm text-white">
													Design Studio
												</div>
												<div className="text-neutral-400 text-xs">
													design@selfmail.com
												</div>
											</div>
										</DropdownMenu.Item>

										<DropdownMenu.Separator className="my-2 h-px bg-neutral-600" />

										<DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-white hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none">
											<Plus className="h-3 w-3" />
											Create Organization
										</DropdownMenu.Item>

										<DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-white hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none">
											<Settings className="h-3 w-3" />
											Manage Organizations
										</DropdownMenu.Item>
									</DropdownMenu.Content>
								</DropdownMenu.Portal>
							</DropdownMenu.Root>
						</div>

						{/* Compose Button */}
						<div className="px-3 py-1.5">
							<Dialog.Root>
								<Dialog.Trigger asChild>
									<button
										type="button"
										className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-white transition-colors hover:bg-neutral-700"
									>
										<Plus className="h-3 w-3" />
										New
									</button>
								</Dialog.Trigger>
								<Dialog.Portal>
									<Dialog.Overlay className="fixed inset-0 bg-black/50" />
									<Dialog.Content className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 w-full max-w-md rounded-lg border border-neutral-600 bg-neutral-800 p-6 shadow-lg">
										<Dialog.Title className="mb-4 font-semibold text-lg text-white">
											Compose New Email
										</Dialog.Title>
										<div className="space-y-4">
											<div>
												<Label.Root className="font-medium text-neutral-300 text-sm">
													To
												</Label.Root>
												<input
													type="email"
													className="mt-1 w-full rounded border border-neutral-600 bg-neutral-700 px-3 py-2 text-sm text-white placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
													placeholder="recipient@example.com"
												/>
											</div>
											<div>
												<Label.Root className="font-medium text-neutral-300 text-sm">
													Subject
												</Label.Root>
												<input
													type="text"
													className="mt-1 w-full rounded border border-neutral-600 bg-neutral-700 px-3 py-2 text-sm text-white placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
													placeholder="Subject"
												/>
											</div>
											<div>
												<Label.Root className="font-medium text-neutral-300 text-sm">
													Message
												</Label.Root>
												<textarea
													rows={6}
													className="mt-1 w-full rounded border border-neutral-600 bg-neutral-700 px-3 py-2 text-sm text-white placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
													placeholder="Type your message here..."
												/>
											</div>
										</div>
										<div className="mt-6 flex justify-end gap-2">
											<Dialog.Close asChild>
												<button
													type="button"
													className="rounded px-3 py-1.5 text-neutral-300 text-sm transition-colors hover:bg-neutral-700"
												>
													Cancel
												</button>
											</Dialog.Close>
											<button
												type="button"
												className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-blue-700"
											>
												Send
											</button>
										</div>
									</Dialog.Content>
								</Dialog.Portal>
							</Dialog.Root>
						</div>

						{/* Navigation */}
						<nav className="flex-1 px-2">
							<div className="space-y-0.5">
								<Tooltip.Root>
									<Tooltip.Trigger asChild>
										<button
											type="button"
											className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-sm text-white"
										>
											<Inbox className="h-3 w-3" />
											Inbox
											<span className="ml-auto rounded bg-neutral-600 px-1 py-0.5 text-xs">
												5
											</span>
										</button>
									</Tooltip.Trigger>
									<Tooltip.Portal>
										<Tooltip.Content
											className="rounded bg-neutral-700 px-2 py-1 text-white text-xs shadow-lg"
											sideOffset={5}
										>
											View all incoming emails
											<Tooltip.Arrow className="fill-neutral-700" />
										</Tooltip.Content>
									</Tooltip.Portal>
								</Tooltip.Root>

								<Tooltip.Root>
									<Tooltip.Trigger asChild>
										<button
											type="button"
											className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-neutral-400 text-sm transition-colors hover:bg-neutral-700 hover:text-white"
										>
											<Star className="h-3 w-3" />
											Starred
										</button>
									</Tooltip.Trigger>
									<Tooltip.Portal>
										<Tooltip.Content
											className="rounded bg-neutral-700 px-2 py-1 text-white text-xs shadow-lg"
											sideOffset={5}
										>
											Important emails you've starred
											<Tooltip.Arrow className="fill-neutral-700" />
										</Tooltip.Content>
									</Tooltip.Portal>
								</Tooltip.Root>

								<button
									type="button"
									className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-neutral-400 text-sm transition-colors hover:bg-neutral-700 hover:text-white"
								>
									<Send className="h-3 w-3" />
									Sent
								</button>
								<button
									type="button"
									className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-neutral-400 text-sm transition-colors hover:bg-neutral-700 hover:text-white"
								>
									<Archive className="h-3 w-3" />
									Archive
								</button>
								<button
									type="button"
									className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-neutral-400 text-sm transition-colors hover:bg-neutral-700 hover:text-white"
								>
									<Trash2 className="h-3 w-3" />
									Trash
								</button>
							</div>

							{/* Divider */}
							<div className="my-3 border-neutral-700 border-t" />

							{/* Labels Section */}
							<div className="space-y-0.5">
								<div className="flex items-center justify-between px-2 py-0.5">
									<Label.Root className="font-medium text-neutral-500 text-xs uppercase tracking-wide">
										Labels
									</Label.Root>
									<DropdownMenu.Root>
										<DropdownMenu.Trigger asChild>
											<button
												type="button"
												className="rounded p-0.5 text-neutral-500 hover:bg-neutral-700 hover:text-neutral-300"
											>
												<Plus className="h-3 w-3" />
											</button>
										</DropdownMenu.Trigger>
										<DropdownMenu.Portal>
											<DropdownMenu.Content
												className="min-w-[180px] rounded-md border border-neutral-600 bg-neutral-800 p-1 shadow-lg"
												sideOffset={5}
											>
												<DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-white hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none">
													<Tag className="h-3 w-3 text-blue-400" />
													Work
												</DropdownMenu.Item>
												<DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-white hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none">
													<Tag className="h-3 w-3 text-green-400" />
													Personal
												</DropdownMenu.Item>
												<DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-white hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none">
													<Tag className="h-3 w-3 text-red-400" />
													Important
												</DropdownMenu.Item>
												<DropdownMenu.Separator className="my-1 h-px bg-neutral-600" />
												<DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-white hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none">
													<Plus className="h-3 w-3" />
													Create New Label
												</DropdownMenu.Item>
											</DropdownMenu.Content>
										</DropdownMenu.Portal>
									</DropdownMenu.Root>
								</div>
								<button
									type="button"
									className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-neutral-400 text-sm transition-colors hover:bg-neutral-700 hover:text-white"
								>
									<Tag className="h-3 w-3 text-blue-400" />
									Work
									<span className="ml-auto text-xs">12</span>
								</button>
								<button
									type="button"
									className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-neutral-400 text-sm transition-colors hover:bg-neutral-700 hover:text-white"
								>
									<Tag className="h-3 w-3 text-green-400" />
									Personal
									<span className="ml-auto text-xs">3</span>
								</button>
							</div>

							{/* Divider */}
							<div className="my-3 border-neutral-700 border-t" />

							{/* Quick Actions */}
							<div className="space-y-0.5">
								<div className="px-2 py-0.5">
									<Label.Root className="font-medium text-neutral-500 text-xs uppercase tracking-wide">
										Actions
									</Label.Root>
								</div>
								<button
									type="button"
									className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-neutral-400 text-sm transition-colors hover:bg-neutral-700 hover:text-white"
								>
									<Filter className="h-3 w-3" />
									Filter
								</button>
								<button
									type="button"
									className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-neutral-400 text-sm transition-colors hover:bg-neutral-700 hover:text-white"
								>
									<Search className="h-3 w-3" />
									Search
								</button>
							</div>
						</nav>

						{/* Storage Info */}
						<div className="border-neutral-700 border-t p-2.5">
							<div className="mb-1.5 text-neutral-500 text-xs">Storage</div>
							<div className="mb-1 h-0.5 w-full rounded-full bg-neutral-700">
								<div
									className="h-0.5 rounded-full bg-neutral-400"
									style={{ width: "68%" }}
								/>
							</div>
							<div className="text-neutral-400 text-xs">6.8 GB of 10 GB</div>
						</div>
					</div>

					{/* Main Dashboard Box - Contains email content and side panel */}
					<div className="relative flex-1">
						<div className="rounded-xl border border-neutral-700 bg-neutral-900 shadow-2xl">
							<div className="flex h-[calc(100vh-8rem)] w-full flex-row overflow-hidden rounded-xl">
								{/* Main Content */}
								<div className="flex flex-1 flex-col bg-neutral-900">
									{/* Header */}
									<div className="flex h-12 items-center justify-between border-neutral-700 border-b px-4">
										<div className="flex items-center gap-3">
											<h2 className="font-medium text-base text-white">
												Inbox
											</h2>
											<span className="text-neutral-400 text-sm">5 unread</span>
											<DropdownMenu.Root>
												<DropdownMenu.Trigger asChild>
													<button
														type="button"
														className="flex items-center gap-1 rounded px-2 py-1 text-neutral-400 text-sm transition-colors hover:bg-neutral-800 hover:text-white"
													>
														<ChevronDown className="h-3 w-3" />
													</button>
												</DropdownMenu.Trigger>
												<DropdownMenu.Portal>
													<DropdownMenu.Content
														className="min-w-[160px] rounded-md border border-neutral-600 bg-neutral-800 p-1 shadow-lg"
														sideOffset={5}
													>
														<DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-white hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none">
															<Inbox className="h-3 w-3" />
															Inbox
														</DropdownMenu.Item>
														<DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-white hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none">
															<Star className="h-3 w-3" />
															Starred
														</DropdownMenu.Item>
														<DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-white hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none">
															<Send className="h-3 w-3" />
															Sent
														</DropdownMenu.Item>
														<DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-white hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none">
															<Archive className="h-3 w-3" />
															Archive
														</DropdownMenu.Item>
													</DropdownMenu.Content>
												</DropdownMenu.Portal>
											</DropdownMenu.Root>
										</div>

										<div className="flex items-center gap-1">
											{/* Search */}
											<div className="relative">
												<Search className="-translate-y-1/2 absolute top-1/2 left-2.5 h-3 w-3 transform text-neutral-400" />
												<input
													type="text"
													placeholder="Search..."
													className="rounded border border-neutral-600 bg-neutral-800 py-1.5 pr-3 pl-8 text-sm text-white placeholder-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
												/>
											</div>

											{/* Filter Dropdown */}
											<DropdownMenu.Root>
												<DropdownMenu.Trigger asChild>
													<Tooltip.Root>
														<Tooltip.Trigger asChild>
															<button
																type="button"
																className="rounded p-1.5 transition-colors hover:bg-neutral-800"
															>
																<Filter className="h-3 w-3 text-neutral-400" />
															</button>
														</Tooltip.Trigger>
														<Tooltip.Portal>
															<Tooltip.Content
																className="rounded bg-neutral-700 px-2 py-1 text-white text-xs shadow-lg"
																sideOffset={5}
															>
																Filter emails
																<Tooltip.Arrow className="fill-neutral-700" />
															</Tooltip.Content>
														</Tooltip.Portal>
													</Tooltip.Root>
												</DropdownMenu.Trigger>
												<DropdownMenu.Portal>
													<DropdownMenu.Content
														className="min-w-[200px] rounded-md border border-neutral-600 bg-neutral-800 p-2 shadow-lg"
														sideOffset={5}
													>
														<div className="mb-2">
															<Label.Root className="font-medium text-neutral-300 text-sm">
																Show emails from
															</Label.Root>
														</div>
														<DropdownMenu.CheckboxItem
															className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-white hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none"
															checked={true}
														>
															<DropdownMenu.ItemIndicator>
																<Check className="h-3 w-3" />
															</DropdownMenu.ItemIndicator>
															Last 7 days
														</DropdownMenu.CheckboxItem>
														<DropdownMenu.CheckboxItem
															className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-white hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none"
															checked={false}
														>
															<DropdownMenu.ItemIndicator>
																<Check className="h-3 w-3" />
															</DropdownMenu.ItemIndicator>
															Unread only
														</DropdownMenu.CheckboxItem>
														<DropdownMenu.CheckboxItem
															className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-white hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none"
															checked={false}
														>
															<DropdownMenu.ItemIndicator>
																<Check className="h-3 w-3" />
															</DropdownMenu.ItemIndicator>
															Has attachments
														</DropdownMenu.CheckboxItem>
														<DropdownMenu.Separator className="my-2 h-px bg-neutral-600" />
														<DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-white hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none">
															Reset filters
														</DropdownMenu.Item>
													</DropdownMenu.Content>
												</DropdownMenu.Portal>
											</DropdownMenu.Root>

											<Tooltip.Root>
												<Tooltip.Trigger asChild>
													<button
														type="button"
														className="rounded p-1.5 transition-colors hover:bg-neutral-800"
													>
														<RefreshCw className="h-3 w-3 text-neutral-400" />
													</button>
												</Tooltip.Trigger>
												<Tooltip.Portal>
													<Tooltip.Content
														className="rounded bg-neutral-700 px-2 py-1 text-white text-xs shadow-lg"
														sideOffset={5}
													>
														Refresh
														<Tooltip.Arrow className="fill-neutral-700" />
													</Tooltip.Content>
												</Tooltip.Portal>
											</Tooltip.Root>
										</div>
									</div>
									{/* Toolbar */}
									<div className="flex items-center gap-1 border-neutral-700 border-b bg-neutral-800 px-4 py-2">
										<Checkbox.Root className="flex h-4 w-4 items-center justify-center rounded border border-neutral-500 bg-neutral-700 hover:border-neutral-400">
											<Checkbox.Indicator>
												<Check className="h-3 w-3 text-white" />
											</Checkbox.Indicator>
										</Checkbox.Root>

										<DropdownMenu.Root>
											<DropdownMenu.Trigger asChild>
												<button
													type="button"
													className="ml-1 rounded p-1 transition-colors hover:bg-neutral-700"
												>
													<ChevronDown className="h-3 w-3 text-neutral-400" />
												</button>
											</DropdownMenu.Trigger>
											<DropdownMenu.Portal>
												<DropdownMenu.Content
													className="min-w-[150px] rounded-md border border-neutral-600 bg-neutral-800 p-1 shadow-lg"
													sideOffset={5}
												>
													<DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-white hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none">
														Select all
													</DropdownMenu.Item>
													<DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-white hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none">
														Select none
													</DropdownMenu.Item>
													<DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-white hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none">
														Select unread
													</DropdownMenu.Item>
												</DropdownMenu.Content>
											</DropdownMenu.Portal>
										</DropdownMenu.Root>

										<div className="mx-2 h-4 w-px bg-neutral-600" />

										<Tooltip.Root>
											<Tooltip.Trigger asChild>
												<button
													type="button"
													className="rounded p-1 transition-colors hover:bg-neutral-700"
												>
													<Archive className="h-3 w-3 text-neutral-400" />
												</button>
											</Tooltip.Trigger>
											<Tooltip.Portal>
												<Tooltip.Content
													className="rounded bg-neutral-700 px-2 py-1 text-white text-xs shadow-lg"
													sideOffset={5}
												>
													Archive
													<Tooltip.Arrow className="fill-neutral-700" />
												</Tooltip.Content>
											</Tooltip.Portal>
										</Tooltip.Root>

										<Tooltip.Root>
											<Tooltip.Trigger asChild>
												<button
													type="button"
													className="rounded p-1 transition-colors hover:bg-neutral-700"
												>
													<Trash2 className="h-3 w-3 text-neutral-400" />
												</button>
											</Tooltip.Trigger>
											<Tooltip.Portal>
												<Tooltip.Content
													className="rounded bg-neutral-700 px-2 py-1 text-white text-xs shadow-lg"
													sideOffset={5}
												>
													Delete
													<Tooltip.Arrow className="fill-neutral-700" />
												</Tooltip.Content>
											</Tooltip.Portal>
										</Tooltip.Root>

										<Tooltip.Root>
											<Tooltip.Trigger asChild>
												<button
													type="button"
													className="rounded p-1 transition-colors hover:bg-neutral-700"
												>
													<Star className="h-3 w-3 text-neutral-400" />
												</button>
											</Tooltip.Trigger>
											<Tooltip.Portal>
												<Tooltip.Content
													className="rounded bg-neutral-700 px-2 py-1 text-white text-xs shadow-lg"
													sideOffset={5}
												>
													Star
													<Tooltip.Arrow className="fill-neutral-700" />
												</Tooltip.Content>
											</Tooltip.Portal>
										</Tooltip.Root>

										{/* Labels Dropdown */}
										<DropdownMenu.Root>
											<DropdownMenu.Trigger asChild>
												<Tooltip.Root>
													<Tooltip.Trigger asChild>
														<button
															type="button"
															className="rounded p-1 transition-colors hover:bg-neutral-700"
														>
															<Tag className="h-3 w-3 text-neutral-400" />
														</button>
													</Tooltip.Trigger>
													<Tooltip.Portal>
														<Tooltip.Content
															className="rounded bg-neutral-700 px-2 py-1 text-white text-xs shadow-lg"
															sideOffset={5}
														>
															Add label
															<Tooltip.Arrow className="fill-neutral-700" />
														</Tooltip.Content>
													</Tooltip.Portal>
												</Tooltip.Root>
											</DropdownMenu.Trigger>
											<DropdownMenu.Portal>
												<DropdownMenu.Content
													className="min-w-[150px] rounded-md border border-neutral-600 bg-neutral-800 p-1 shadow-lg"
													sideOffset={5}
												>
													<DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-white hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none">
														<Tag className="h-3 w-3 text-blue-400" />
														Work
													</DropdownMenu.Item>
													<DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-white hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none">
														<Tag className="h-3 w-3 text-green-400" />
														Personal
													</DropdownMenu.Item>
													<DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-white hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none">
														<Tag className="h-3 w-3 text-red-400" />
														Important
													</DropdownMenu.Item>
												</DropdownMenu.Content>
											</DropdownMenu.Portal>
										</DropdownMenu.Root>

										<div className="ml-auto flex items-center gap-1 text-neutral-400 text-sm">
											1-5 of 5
											<DropdownMenu.Root>
												<DropdownMenu.Trigger asChild>
													<button
														type="button"
														className="rounded p-1 transition-colors hover:bg-neutral-700"
													>
														<ChevronDown className="h-3 w-3" />
													</button>
												</DropdownMenu.Trigger>
												<DropdownMenu.Portal>
													<DropdownMenu.Content
														className="min-w-[120px] rounded-md border border-neutral-600 bg-neutral-800 p-1 shadow-lg"
														sideOffset={5}
													>
														<DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-white hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none">
															25 per page
														</DropdownMenu.Item>
														<DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-white hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none">
															50 per page
														</DropdownMenu.Item>
														<DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-white hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none">
															100 per page
														</DropdownMenu.Item>
													</DropdownMenu.Content>
												</DropdownMenu.Portal>
											</DropdownMenu.Root>
										</div>
									</div>{" "}
									{/* Email List */}
									<div className="flex-1 overflow-y-auto">
										{emails.map((email) => (
											<div
												key={email.id}
												className={`group flex cursor-pointer items-center gap-3 border-neutral-700 border-b px-4 py-2.5 transition-colors hover:bg-neutral-800 ${
													!email.isRead ? "bg-neutral-800/50" : ""
												}`}
											>
												{/* Checkbox */}
												<Checkbox.Root className="flex h-4 w-4 items-center justify-center rounded border border-neutral-500 bg-neutral-700 hover:border-neutral-400">
													<Checkbox.Indicator>
														<Check className="h-3 w-3 text-white" />
													</Checkbox.Indicator>
												</Checkbox.Root>

												{/* Star */}
												<Tooltip.Root>
													<Tooltip.Trigger asChild>
														<button
															type="button"
															className="rounded p-0.5 transition-colors hover:bg-neutral-700"
														>
															<Star
																className={`h-3 w-3 ${email.isStarred ? "fill-current text-yellow-500" : "text-neutral-400"}`}
															/>
														</button>
													</Tooltip.Trigger>
													<Tooltip.Portal>
														<Tooltip.Content
															className="rounded bg-neutral-700 px-2 py-1 text-white text-xs shadow-lg"
															sideOffset={5}
														>
															{email.isStarred ? "Remove star" : "Add star"}
															<Tooltip.Arrow className="fill-neutral-700" />
														</Tooltip.Content>
													</Tooltip.Portal>
												</Tooltip.Root>

												{/* Priority Indicator */}
												{email.priority === "high" && (
													<Tooltip.Root>
														<Tooltip.Trigger asChild>
															<div className="h-6 w-0.5 rounded-full bg-red-500" />
														</Tooltip.Trigger>
														<Tooltip.Portal>
															<Tooltip.Content
																className="rounded bg-neutral-700 px-2 py-1 text-white text-xs shadow-lg"
																sideOffset={5}
															>
																High priority
																<Tooltip.Arrow className="fill-neutral-700" />
															</Tooltip.Content>
														</Tooltip.Portal>
													</Tooltip.Root>
												)}

												{/* Content */}
												<div className="min-w-0 flex-1">
													<div className="flex items-center gap-2">
														<span
															className={`text-sm ${!email.isRead ? "font-medium text-white" : "text-neutral-300"}`}
														>
															{email.fromName}
														</span>
														<span className="truncate text-neutral-500 text-xs">
															{email.from}
														</span>
														{email.hasAttachment && (
															<Tooltip.Root>
																<Tooltip.Trigger asChild>
																	<Paperclip className="h-3 w-3 text-neutral-400" />
																</Tooltip.Trigger>
																<Tooltip.Portal>
																	<Tooltip.Content
																		className="rounded bg-neutral-700 px-2 py-1 text-white text-xs shadow-lg"
																		sideOffset={5}
																	>
																		Has attachment
																		<Tooltip.Arrow className="fill-neutral-700" />
																	</Tooltip.Content>
																</Tooltip.Portal>
															</Tooltip.Root>
														)}
													</div>
													<div
														className={`truncate text-sm ${!email.isRead ? "font-medium text-white" : "text-neutral-300"}`}
													>
														{email.subject}
													</div>
													<div className="truncate text-neutral-500 text-xs">
														{email.preview}
													</div>
												</div>

												{/* Time & Actions */}
												<div className="flex items-center gap-1">
													<span className="text-neutral-500 text-xs">
														{email.time}
													</span>
													<button
														type="button"
														onClick={() => openEmailDetails(email.id)}
														className="rounded p-0.5 opacity-0 transition-all hover:bg-neutral-700 group-hover:opacity-100"
													>
														<MoreHorizontal className="h-3 w-3 text-neutral-400" />
													</button>
												</div>
											</div>
										))}
									</div>
								</div>
								{/* Side Panel - Positioned absolutely on the right side of the main box */}
								{sidePanelOpen && selectedEmail && (
									<div className="slide-in-from-right absolute top-0 right-0 z-10 h-full w-96 animate-in border-neutral-700 border-l bg-neutral-800 shadow-lg transition-transform duration-300 ease-out">
										{/* Panel Header */}
										<div className="flex items-center justify-between border-neutral-700 border-b p-4">
											<h3 className="font-medium text-white">Email Details</h3>
											<button
												type="button"
												onClick={closeSidePanel}
												className="rounded p-1 transition-colors hover:bg-neutral-700"
											>
												<X className="h-4 w-4 text-neutral-400" />
											</button>
										</div>

										{/* Panel Content */}
										<div className="flex-1 space-y-6 overflow-y-auto p-4">
											{/* Email Header Info */}
											<div className="space-y-3">
												<div>
													<Label.Root className="text-neutral-400 text-xs uppercase tracking-wide">
														From
													</Label.Root>
													<div className="mt-1 flex items-center gap-2">
														<Avatar.Root className="inline-flex h-8 w-8 select-none items-center justify-center overflow-hidden rounded-full bg-neutral-600">
															<Avatar.Fallback className="flex h-full w-full items-center justify-center bg-blue-600 font-medium text-sm text-white">
																{selectedEmail.fromName.charAt(0)}
															</Avatar.Fallback>
														</Avatar.Root>
														<div>
															<div className="font-medium text-sm text-white">
																{selectedEmail.fromName}
															</div>
															<div className="text-neutral-400 text-xs">
																{selectedEmail.from}
															</div>
														</div>
													</div>
												</div>

												<div>
													<Label.Root className="text-neutral-400 text-xs uppercase tracking-wide">
														Subject
													</Label.Root>
													<div className="mt-1 font-medium text-sm text-white">
														{selectedEmail.subject}
													</div>
												</div>

												<div className="flex items-center gap-4">
													<div>
														<Label.Root className="text-neutral-400 text-xs uppercase tracking-wide">
															Time
														</Label.Root>
														<div className="mt-1 flex items-center gap-1 text-neutral-300 text-sm">
															<Clock className="h-3 w-3" />
															{selectedEmail.time}
														</div>
													</div>

													<div>
														<Label.Root className="text-neutral-400 text-xs uppercase tracking-wide">
															Priority
														</Label.Root>
														<div className="mt-1 flex items-center gap-1 text-neutral-300 text-sm">
															{selectedEmail.priority === "high" ? (
																<>
																	<AlertCircle className="h-3 w-3 text-red-400" />
																	<span className="text-red-400">High</span>
																</>
															) : (
																<>
																	<Mail className="h-3 w-3" />
																	<span>Normal</span>
																</>
															)}
														</div>
													</div>
												</div>
											</div>

											{/* Email Status */}
											<div className="space-y-3">
												<Label.Root className="text-neutral-400 text-xs uppercase tracking-wide">
													Status
												</Label.Root>
												<div className="flex flex-wrap gap-2">
													<span
														className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
															selectedEmail.isRead
																? "bg-green-600/20 text-green-400"
																: "bg-blue-600/20 text-blue-400"
														}`}
													>
														{selectedEmail.isRead ? "● Read" : "● Unread"}
													</span>
													{selectedEmail.isStarred && (
														<span className="inline-flex items-center gap-1 rounded-full bg-yellow-600/20 px-2 py-1 text-xs text-yellow-400">
															<Star className="h-3 w-3 fill-current" />
															Starred
														</span>
													)}
													{selectedEmail.hasAttachment && (
														<span className="inline-flex items-center gap-1 rounded-full bg-purple-600/20 px-2 py-1 text-purple-400 text-xs">
															<Paperclip className="h-3 w-3" />
															Attachment
														</span>
													)}
												</div>
											</div>

											{/* Email Preview */}
											<div className="space-y-3">
												<Label.Root className="text-neutral-400 text-xs uppercase tracking-wide">
													Preview
												</Label.Root>
												<div className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-3 text-neutral-300 text-sm leading-relaxed">
													{selectedEmail.preview}
												</div>
											</div>

											{/* Quick Actions */}
											<div className="space-y-3">
												<Label.Root className="text-neutral-400 text-xs uppercase tracking-wide">
													Quick Actions
												</Label.Root>
												<div className="grid grid-cols-2 gap-2">
													<button
														type="button"
														className="flex items-center justify-center gap-2 rounded-lg border border-neutral-600 bg-neutral-700/50 px-3 py-2 text-sm text-white transition-colors hover:bg-neutral-700"
													>
														<Archive className="h-3 w-3" />
														Archive
													</button>
													<button
														type="button"
														className="flex items-center justify-center gap-2 rounded-lg border border-neutral-600 bg-neutral-700/50 px-3 py-2 text-sm text-white transition-colors hover:bg-neutral-700"
													>
														<Star className="h-3 w-3" />
														{selectedEmail.isStarred ? "Unstar" : "Star"}
													</button>
													<button
														type="button"
														className="flex items-center justify-center gap-2 rounded-lg border border-neutral-600 bg-neutral-700/50 px-3 py-2 text-sm text-white transition-colors hover:bg-neutral-700"
													>
														<Tag className="h-3 w-3" />
														Label
													</button>
													<button
														type="button"
														className="flex items-center justify-center gap-2 rounded-lg border border-red-600/50 bg-red-600/10 px-3 py-2 text-red-400 text-sm transition-colors hover:bg-red-600/20"
													>
														<Trash2 className="h-3 w-3" />
														Delete
													</button>
												</div>
											</div>
										</div>
									</div>
								)}

								{/* Email Preview Pane (Default state when no side panel) */}
								{!sidePanelOpen && (
									<div className="w-80 border-neutral-700 border-l bg-neutral-900 p-4">
										<div className="mt-16 text-center text-neutral-500">
											<Avatar.Root className="mx-auto mb-3 inline-flex h-12 w-12 select-none items-center justify-center overflow-hidden rounded-full bg-neutral-700 align-middle">
												<Avatar.Image
													className="h-full w-full rounded-full object-cover"
													src=""
													alt=""
												/>
												<Avatar.Fallback className="flex h-full w-full items-center justify-center bg-neutral-700 font-medium text-neutral-300 text-sm">
													<Inbox className="h-6 w-6" />
												</Avatar.Fallback>
											</Avatar.Root>
											<p className="mb-1 font-medium text-base text-neutral-400">
												Select an email
											</p>
											<p className="mb-4 text-neutral-500 text-sm">
												Choose an email from the list to view it here
											</p>

											{/* Quick Actions */}
											<div className="space-y-2">
												<Label.Root className="block font-medium text-neutral-400 text-xs uppercase tracking-wide">
													Quick Actions
												</Label.Root>
												<div className="flex flex-col gap-2">
													<button
														type="button"
														className="flex items-center gap-2 rounded bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700"
													>
														<Plus className="h-3 w-3" />
														Compose
													</button>
													<button
														type="button"
														className="flex items-center gap-2 rounded border border-neutral-600 px-3 py-2 text-neutral-300 text-sm transition-colors hover:bg-neutral-800"
													>
														<Search className="h-3 w-3" />
														Advanced Search
													</button>
												</div>
											</div>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</Tooltip.Provider>
	);
}
