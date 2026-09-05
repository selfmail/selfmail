import { useNavigate } from "@tanstack/react-router";
import {
	BotIcon,
	Code2Icon,
	ContactIcon,
	GlobeIcon,
	InboxIcon,
	MessageCircleIcon,
	PlusIcon,
	SettingsIcon,
	WorkflowIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "#/components/ui/command";
import { m } from "#/paraglide/messages";

type CommandMenuProps = {
	workspaceSlug: string;
};

export function CommandMenu({ workspaceSlug }: CommandMenuProps) {
	const [open, setOpen] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (
				event.key.toLowerCase() !== "k" ||
				!(event.metaKey || event.ctrlKey)
			) {
				return;
			}

			event.preventDefault();
			setOpen((currentOpen) => !currentOpen);
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	const runCommand = (command: () => void) => {
		setOpen(false);
		command();
	};
	const navigateToWorkspacePage = (
		to:
			| "/$workspaceSlug"
			| "/$workspaceSlug/ai"
			| "/$workspaceSlug/contacts"
			| "/$workspaceSlug/conversations"
			| "/$workspaceSlug/dev"
			| "/$workspaceSlug/workflows",
	) => {
		void navigate({ params: { workspaceSlug }, to });
	};
	const openSettingsPage = (page: "app" | "domains") => {
		void navigate({
			params: { workspaceSlug },
			search: { "settings-page": page },
			to: "/$workspaceSlug",
		});
	};

	return (
		<CommandDialog
			description={m["dashboard.command.description"]()}
			onOpenChange={setOpen}
			open={open}
			title={m["dashboard.command.title"]()}
		>
			<CommandInput
				aria-label={m["dashboard.command.placeholder"]()}
				placeholder={m["dashboard.command.placeholder"]()}
			/>
			<CommandList>
				<CommandEmpty>{m["dashboard.command.empty"]()}</CommandEmpty>
				<CommandGroup heading={m["dashboard.command.navigation"]()}>
					<CommandItem
						onSelect={() =>
							runCommand(() => navigateToWorkspacePage("/$workspaceSlug"))
						}
					>
						<InboxIcon />
						{m["dashboard.inbox.unified"]()}
					</CommandItem>
					<CommandItem
						onSelect={() =>
							runCommand(() =>
								navigateToWorkspacePage("/$workspaceSlug/contacts"),
							)
						}
					>
						<ContactIcon />
						{m["dashboard.navigation.contacts"]()}
					</CommandItem>
					<CommandItem
						onSelect={() =>
							runCommand(() =>
								navigateToWorkspacePage("/$workspaceSlug/conversations"),
							)
						}
					>
						<MessageCircleIcon />
						{m["dashboard.navigation.conversations"]()}
					</CommandItem>
					<CommandItem
						onSelect={() =>
							runCommand(() => navigateToWorkspacePage("/$workspaceSlug/ai"))
						}
					>
						<BotIcon />
						{m["dashboard.navigation.ai"]()}
					</CommandItem>
					<CommandItem
						onSelect={() =>
							runCommand(() =>
								navigateToWorkspacePage("/$workspaceSlug/workflows"),
							)
						}
					>
						<WorkflowIcon />
						{m["dashboard.navigation.workflows"]()}
					</CommandItem>
					<CommandItem
						onSelect={() =>
							runCommand(() => navigateToWorkspacePage("/$workspaceSlug/dev"))
						}
					>
						<Code2Icon />
						{m["dashboard.navigation.developers"]()}
					</CommandItem>
				</CommandGroup>
				<CommandSeparator />
				<CommandGroup heading={m["dashboard.command.actions"]()}>
					<CommandItem
						onSelect={() =>
							runCommand(() => {
								void navigate({
									params: { workspaceSlug },
									to: "/$workspaceSlug/new-address",
								});
							})
						}
					>
						<PlusIcon />
						{m["dashboard.address.add"]()}
					</CommandItem>
					<CommandItem
						onSelect={() => runCommand(() => openSettingsPage("app"))}
					>
						<SettingsIcon />
						{m["dashboard.command.settings"]()}
					</CommandItem>
					<CommandItem
						onSelect={() => runCommand(() => openSettingsPage("domains"))}
					>
						<GlobeIcon />
						{m["dashboard.command.domains"]()}
					</CommandItem>
				</CommandGroup>
			</CommandList>
		</CommandDialog>
	);
}
