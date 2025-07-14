import * as Avatar from "@radix-ui/react-avatar";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Label from "@radix-ui/react-label";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
	Archive,
	Check,
	ChevronDown,
	Filter,
	Inbox,
	Plus,
	Search,
	Send,
	Settings,
	Star,
	Tag,
	Trash2,
} from "lucide-react";

export default function Sidebar() {
	return (
		<div className="flex h-screen w-56 flex-col py-[2.5vh]">
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
								<div className="font-medium text-white text-xs">Acme Corp</div>
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
									<div className="font-medium text-sm text-white">TechCorp</div>
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
			<nav className="flex-1 px-2 ">
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
	);
}
