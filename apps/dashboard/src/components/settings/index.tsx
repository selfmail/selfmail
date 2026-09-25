import { Dialog } from "@base-ui/react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { create } from "zustand";
import { cn } from "#/lib/utils";
import { settingsPages } from "./menu/pages";
import SettingsSidebar from "./menu/sidebar";
import { useSettingsSubpageQuery } from "./menu/subpage-query";
import { settingsSubpages } from "./menu/subpages";

export type Page =
	| "app"
	| "workspace"
	| "billing"
	| "permissions"
	| "upgrade"
	| "storage"
	| "support"
	| "domains"
	| "members"
	| "addresses"
	| "authentication"
	| "spamAnalysis"
	| "workspaceAi";

const pages: Page[] = [
	"app",
	"workspace",
	"billing",
	"permissions",
	"storage",
	"support",
	"domains",
	"members",
	"addresses",
	"upgrade",
	"authentication",
	"spamAnalysis",
	"workspaceAi",
];

interface SettingsDialogPayload {
	page: Page;
}

export const settingsDialogHandle =
	Dialog.createHandle<SettingsDialogPayload>();

function hasSettingsPageParam() {
	return (
		typeof window !== "undefined" &&
		new URLSearchParams(window.location.search).has("settings-page")
	);
}

function getActivePage(page: string) {
	return settingsPages.find((element) => element.id === page);
}

function SettingsDialogContent({
	open,
	page,
	workspaceId,
	workspaceSlug,
	memberId,
	payload,
	setPage,
}: {
	open: boolean;
	page: Page | null;
	workspaceId: string;
	workspaceSlug: string;
	memberId: string;
	payload?: SettingsDialogPayload;
	setPage: ReturnType<typeof useSettingsPageQuery>[1];
}) {
	const [subpage, setSubpage] = useSettingsSubpageQuery();
	const activeSubpage = settingsSubpages.find(
		(item) => item.id === subpage.settings,
	);
	const activePage = page ?? activeSubpage?.parent ?? "app";
	const syncedPayloadPageRef = useRef<Page | null>(null);
	const currentActivePage = getActivePage(activePage);
	const mainTitleRef = useRef<HTMLHeadingElement>(null);
	const previousSubpageRef = useRef(activeSubpage);
	useEffect(() => {
		if (previousSubpageRef.current && !activeSubpage) {
			mainTitleRef.current?.focus();
		}
		previousSubpageRef.current = activeSubpage;
	}, [activeSubpage]);

	useEffect(() => {
		if (!open) {
			syncedPayloadPageRef.current = null;
			return;
		}

		if (hasSettingsPageParam() || activeSubpage) {
			return;
		}

		if (payload?.page && syncedPayloadPageRef.current !== payload.page) {
			syncedPayloadPageRef.current = payload.page;
			setPage(payload.page);
			return;
		}

		setPage(activePage);
	}, [activePage, activeSubpage, open, payload?.page, setPage]);

	if (!currentActivePage) {
		return;
	}

	return (
		<Dialog.Portal>
			<Dialog.Backdrop
				className={cn("fixed inset-0 z-50 bg-black/20 dark:bg-black/50")}
			/>
			<Dialog.Viewport
				className={cn(
					"fixed inset-0 z-50 flex items-center justify-center p-4",
				)}
			>
				<Dialog.Popup
					className={cn(
						"relative flex w-[calc(100vw-2rem)] max-w-4xl flex-row overflow-hidden rounded-xl bg-muted text-foreground h-152",
					)}
					style={{
						maxHeight:
							"calc(100dvh - 2rem - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
					}}
				>
					{activeSubpage ? (
						<activeSubpage.component
							id={activeSubpage.id}
							title={
								getActivePage(activeSubpage.parent)?.title ??
								currentActivePage.title
							}
							itemId={subpage["settings-item"]}
							onBack={() => {
								setSubpage({ settings: null, "settings-item": null });
								setPage(page ?? activeSubpage.parent);
							}}
							memberId={memberId}
							workspaceId={workspaceId}
							workspaceSlug={workspaceSlug}
						/>
					) : (
						<>
							<SettingsSidebar
								activePageId={activePage}
								memberId={memberId}
								setPage={setPage}
								workspaceId={workspaceId}
							/>
							<div className="flex min-h-0 min-w-0 flex-1 flex-col p-2">
								<div className="flex min-h-0 min-w-0 flex-1 flex-col space-y-1 overflow-auto rounded-xl border border-border bg-background p-2 [scrollbar-color:gray_transparent] [scrollbar-width:thin]">
									<Dialog.Title
										ref={mainTitleRef}
										tabIndex={-1}
										className="font-medium text-lg outline-none"
									>
										{currentActivePage.title()}
									</Dialog.Title>
									<currentActivePage.component
										id={currentActivePage.id}
										memberId={memberId}
										title={currentActivePage.title}
										workspaceId={workspaceId}
										workspaceSlug={workspaceSlug}
									/>
								</div>
							</div>
						</>
					)}
					<Dialog.Description className="sr-only">
						{currentActivePage.title()}
					</Dialog.Description>
				</Dialog.Popup>
			</Dialog.Viewport>
		</Dialog.Portal>
	);
}

function useSettingsPageQuery() {
	return useQueryState(
		"settings-page",
		parseAsStringLiteral(pages).withOptions({
			clearOnDefault: false,
			history: "push",
		}),
	);
}

export const useSettingsMenuOpenStore = create<{
	open: boolean;
	setOpen: (open: boolean) => void;
}>((set) => ({
	open: false,
	setOpen: (open) => set({ open }),
}));

export default function SettingsDialog({
	workspaceId,
	workspaceSlug,
	memberId,
}: {
	workspaceId: string;
	workspaceSlug: string;
	memberId: string;
}) {
	const [page, setPage] = useSettingsPageQuery();
	const [subpage, setSubpage] = useSettingsSubpageQuery();
	const { open, setOpen } = useSettingsMenuOpenStore();
	const [triggerId, setTriggerId] = useState<string | null>(null);

	if (
		(page !== null ||
			settingsSubpages.some((item) => item.id === subpage.settings)) &&
		!open
	) {
		setOpen(true);
	}

	const handleOpenChange = (
		isOpen: boolean,
		eventDetails: Dialog.Root.ChangeEventDetails,
	) => {
		if (!isOpen) {
			setPage(null);
			setSubpage({ settings: null, "settings-item": null });
		}
		setOpen(isOpen);
		setTriggerId(eventDetails.trigger?.id ?? null);
	};

	return (
		<Dialog.Root
			handle={settingsDialogHandle}
			onOpenChange={handleOpenChange}
			open={open}
			triggerId={triggerId}
		>
			{({ payload }) => {
				if (!payload) {
					payload = { page: "app" };
				}
				return (
					<SettingsDialogContent
						memberId={memberId}
						open={open}
						page={page as Page}
						payload={payload}
						setPage={setPage}
						workspaceId={workspaceId}
						workspaceSlug={workspaceSlug}
					/>
				);
			}}
		</Dialog.Root>
	);
}
