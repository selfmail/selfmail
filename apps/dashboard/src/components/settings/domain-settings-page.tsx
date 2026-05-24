import { Button } from "@selfmail/ui";
import { useServerFn } from "@tanstack/react-start";
import {
	ArrowUpRightIcon,
	CheckCircle2Icon,
	ClipboardIcon,
	GlobeIcon,
	PlusIcon,
	RefreshCwIcon,
	Trash2Icon,
	XIcon,
} from "lucide-react";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
	Badge,
	Input,
	SettingsBanner,
	SettingsBlock,
	SettingsDialog,
	SettingsDialogContent,
	SettingsDialogDescription,
	SettingsDialogHeader,
	SettingsDialogMain,
	SettingsDialogTitle,
	SettingsGroup,
	Skeleton,
} from "#/components/ui";
import {
	createWorkspaceDomainFn,
	type DashboardDomainDnsRecord,
	type DashboardWorkspaceDomain,
	type DashboardWorkspaceDomainsData,
	deleteWorkspaceDomainFn,
	getWorkspaceDomainsFn,
	verifyWorkspaceDomainFn,
} from "#/lib/workspaces";
import {
	domainError,
	domainNameSchema,
	toDomainName,
} from "#/lib/workspaces/domain-utils";
import { m } from "#/paraglide/messages";
import type { SettingsPageComponent } from "./settings-pages";

const domainDialogSteps = ["domain", "dns", "success"] as const;
const domainMenuItems = ["add", "manage", "delete"] as const;

type DomainDialogStep = (typeof domainDialogSteps)[number];
type DomainMenuItem = (typeof domainMenuItems)[number];

interface DomainDialogProps {
	domain: DashboardWorkspaceDomain | null;
	onDomainChange: (domain: DashboardWorkspaceDomain) => void;
	onSelectedDomainChange: (domainId: string | null) => void;
	onClose: () => void;
	onStepChange: (step: DomainDialogStep | null) => void;
	open: boolean;
	step: DomainDialogStep;
	workspaceSlug: string;
}

interface ManageDomainDialogProps {
	canVerifyDomains: boolean;
	domain: DashboardWorkspaceDomain | null;
	onDomainChange: (domain: DashboardWorkspaceDomain) => void;
	onClose: () => void;
	open: boolean;
	workspaceSlug: string;
}

interface DeleteDomainButtonProps {
	canDeleteDomains: boolean;
	domain: DashboardWorkspaceDomain;
	onDeleted: () => Promise<void>;
	onClose: () => void;
	onOpen: () => void;
	open: boolean;
	workspaceSlug: string;
}

const cloudflareDnsUrl =
	"https://dash.cloudflare.com/?to=/:account/:zone/dns/records";

const domainStatusLabel = {
	pending: m["dashboard.settings.domains.draft"],
	verified: m["dashboard.settings.domains.verified"],
} satisfies Record<DashboardWorkspaceDomain["status"], () => string>;

const domainMenuQueryOptions = {
	history: "replace",
	scroll: false,
	shallow: true,
} as const;

function formatDnsRecord(record: DashboardDomainDnsRecord) {
	return [record.type, record.host, record.priority?.toString(), record.value]
		.filter(Boolean)
		.join(" ");
}

function DnsRecordControl({ record }: { record: DashboardDomainDnsRecord }) {
	const [copied, setCopied] = useState(false);

	const copyRecord = async () => {
		await navigator.clipboard.writeText(formatDnsRecord(record));
		setCopied(true);
	};

	return (
		<Button
			aria-label={m["dashboard.settings.domains.copy_record"]({
				type: record.type,
			})}
			onClick={() => void copyRecord()}
			size="icon-sm"
			type="button"
			variant="ghost"
		>
			<ClipboardIcon className="size-4" />
			<span className="sr-only">
				{copied
					? m["dashboard.settings.domains.copied"]()
					: m["dashboard.settings.domains.copy"]()}
			</span>
		</Button>
	);
}

function DnsRecords({ records }: { records: DashboardDomainDnsRecord[] }) {
	return (
		<SettingsGroup>
			{records.map((record) => (
				<SettingsBlock
					control={<DnsRecordControl record={record} />}
					description={
						<div className="grid gap-1">
							<code className="truncate rounded-md bg-muted px-2 py-1 text-xs">
								{m["dashboard.settings.domains.host"]({ host: record.host })}
							</code>
							<code className="truncate rounded-md bg-muted px-2 py-1 text-xs">
								{m["dashboard.settings.domains.value"]({
									value: `${record.priority ? `${record.priority} ` : ""}${record.value}`,
								})}
							</code>
						</div>
					}
					key={`${record.type}-${record.host}`}
					title={<Badge variant="outline">{record.type}</Badge>}
				/>
			))}
		</SettingsGroup>
	);
}

function CloudflareBanner({ domain }: { domain: DashboardWorkspaceDomain }) {
	if (domain.dnsProvider !== "cloudflare") {
		return null;
	}

	return (
		<SettingsBanner
			action={
				<Button asChild size="sm" variant="outline">
					<a href={cloudflareDnsUrl} rel="noreferrer" target="_blank">
						{m["dashboard.settings.domains.open_cloudflare"]()}
						<ArrowUpRightIcon className="size-4" />
					</a>
				</Button>
			}
			description={m["dashboard.settings.domains.cloudflare_description"]({
				domain: domain.domain,
			})}
			icon={<GlobeIcon />}
			title={m["dashboard.settings.domains.cloudflare_detected"]()}
		/>
	);
}

function DomainSetupContent({
	domain,
	error,
	isSubmitting,
	canVerify = true,
	onVerify,
}: {
	canVerify?: boolean;
	domain: DashboardWorkspaceDomain;
	error: string | null;
	isSubmitting: boolean;
	onVerify: () => void;
}) {
	return (
		<div className="grid gap-4">
			<CloudflareBanner domain={domain} />
			<DnsRecords records={domain.dnsRecords} />
			{error ? (
				<p className="text-destructive text-sm" role="alert">
					{error}
				</p>
			) : null}
			{domain.status === "pending" ? (
				<div className="flex justify-end">
					<Button
						disabled={isSubmitting || !canVerify}
						onClick={onVerify}
						size="sm"
						type="button"
					>
						<RefreshCwIcon className="size-4" />
						{isSubmitting
							? m["dashboard.settings.domains.checking"]()
							: m["dashboard.settings.domains.verify_records"]()}
					</Button>
				</div>
			) : null}
		</div>
	);
}

function AddDomainDialog({
	domain: workspaceDomain,
	onDomainChange,
	onSelectedDomainChange,
	onClose,
	onStepChange,
	open,
	step,
	workspaceSlug,
}: DomainDialogProps) {
	const createDomain = useServerFn(createWorkspaceDomainFn);
	const verifyDomain = useServerFn(verifyWorkspaceDomainFn);
	const [domain, setDomain] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const reset = () => {
		setDomain("");
		setError(null);
		setIsSubmitting(false);
	};
	const closeDialog = () => {
		reset();
		onClose();
	};

	const submitDomain = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const result = domainNameSchema.safeParse(domain);

		if (!result.success) {
			setError(result.error.issues[0]?.message ?? domainError);
			return;
		}

		setError(null);
		setIsSubmitting(true);

		try {
			const created = await createDomain({
				data: {
					domain: result.data,
					workspaceSlug,
				},
			});

			if (created.status === "error") {
				setError(created.error);
				return;
			}

			onDomainChange(created.domain);
			onSelectedDomainChange(created.domain.id);
			onStepChange("dns");
		} finally {
			setIsSubmitting(false);
		}
	};

	const verifyCreatedDomain = async () => {
		if (!workspaceDomain) {
			return;
		}

		setError(null);
		setIsSubmitting(true);

		try {
			const verified = await verifyDomain({
				data: {
					domainId: workspaceDomain.id,
					workspaceSlug,
				},
			});

			if (verified.status === "error") {
				setError(verified.error);
				return;
			}

			onDomainChange(verified.domain);
			onSelectedDomainChange(verified.domain.id);
			onStepChange("success");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<SettingsDialog
			onOpenChange={(open) => {
				if (!open) {
					closeDialog();
				}
			}}
			open={open}
		>
			<SettingsDialogContent
				className="max-w-2xl sm:h-[34rem] sm:flex-col"
				closeLabel={m["dashboard.settings.domains.close_setup"]()}
			>
				<SettingsDialogMain>
					{step === "domain" ? (
						<form className="grid gap-5" noValidate onSubmit={submitDomain}>
							<SettingsDialogHeader>
								<SettingsDialogTitle>
									{m["dashboard.settings.domains.add_title"]()}
								</SettingsDialogTitle>
								<SettingsDialogDescription>
									{m["dashboard.settings.domains.add_description"]()}
								</SettingsDialogDescription>
							</SettingsDialogHeader>
							<SettingsGroup>
								<SettingsBlock
									description={
										<div className="grid gap-2">
											<Input
												aria-describedby={
													error ? "domain-name-error" : undefined
												}
												aria-invalid={Boolean(error)}
												id="domain-name"
												inputMode="url"
												onChange={(event) => {
													setDomain(toDomainName(event.target.value));
													setError(null);
												}}
												placeholder={m[
													"dashboard.settings.domains.placeholder"
												]()}
												value={domain}
											/>
											{error ? (
												<p
													className="text-destructive text-sm"
													id="domain-name-error"
												>
													{error}
												</p>
											) : null}
										</div>
									}
									title={
										<label htmlFor="domain-name">
											{m["dashboard.settings.domains.domain_name"]()}
										</label>
									}
								/>
							</SettingsGroup>
							<div className="flex justify-end">
								<Button disabled={isSubmitting} size="sm" type="submit">
									{isSubmitting
										? m["dashboard.settings.domains.adding"]()
										: m["dashboard.settings.domains.continue"]()}
								</Button>
							</div>
						</form>
					) : null}
					{step === "dns" && workspaceDomain ? (
						<>
							<SettingsDialogHeader>
								<SettingsDialogTitle>
									{m["dashboard.settings.domains.create_records"]()}
								</SettingsDialogTitle>
								<SettingsDialogDescription>
									{m["dashboard.settings.domains.create_records_description"]()}
								</SettingsDialogDescription>
							</SettingsDialogHeader>
							<DomainSetupContent
								domain={workspaceDomain}
								error={error}
								isSubmitting={isSubmitting}
								onVerify={verifyCreatedDomain}
							/>
						</>
					) : null}
					{step === "success" && workspaceDomain ? (
						<div className="grid h-full place-items-center text-center">
							<div className="grid max-w-sm gap-4">
								<div className="mx-auto grid size-12 place-items-center rounded-full bg-primary text-primary-foreground">
									<CheckCircle2Icon className="size-6" />
								</div>
								<SettingsDialogHeader className="text-center">
									<SettingsDialogTitle>
										{m["dashboard.settings.domains.verified_title"]({
											domain: workspaceDomain.domain,
										})}
									</SettingsDialogTitle>
									<SettingsDialogDescription>
										{m["dashboard.settings.domains.verified_description"]()}
									</SettingsDialogDescription>
								</SettingsDialogHeader>
								<div className="flex justify-center">
									<Button onClick={closeDialog} size="sm" type="button">
										{m["dashboard.settings.domains.done"]()}
									</Button>
								</div>
							</div>
						</div>
					) : null}
				</SettingsDialogMain>
			</SettingsDialogContent>
		</SettingsDialog>
	);
}

function ManageDomainDialog({
	canVerifyDomains,
	domain,
	onDomainChange,
	onClose,
	open,
	workspaceSlug,
}: ManageDomainDialogProps) {
	const verifyDomain = useServerFn(verifyWorkspaceDomainFn);
	const [error, setError] = useState<string | null>(null);
	const [isVerifying, setIsVerifying] = useState(false);

	const verifyCurrentDomain = async () => {
		if (!domain) {
			return;
		}

		setError(null);
		setIsVerifying(true);

		try {
			const result = await verifyDomain({
				data: {
					domainId: domain.id,
					workspaceSlug,
				},
			});

			if (result.status === "error") {
				setError(result.error);
				return;
			}

			onDomainChange(result.domain);
		} finally {
			setIsVerifying(false);
		}
	};

	return (
		<SettingsDialog
			onOpenChange={(open) => {
				if (!open) {
					setError(null);
					onClose();
				}
			}}
			open={open}
		>
			<SettingsDialogContent
				className="max-w-2xl sm:h-[34rem] sm:flex-col"
				closeLabel={m["dashboard.settings.domains.close_manage"]({
					domain: domain?.domain ?? m["dashboard.settings.domains.domain"](),
				})}
			>
				{domain ? (
					<SettingsDialogMain>
						<SettingsDialogHeader>
							<SettingsDialogTitle>{domain.domain}</SettingsDialogTitle>
							<SettingsDialogDescription>
								{m["dashboard.settings.domains.manage_description"]()}
							</SettingsDialogDescription>
						</SettingsDialogHeader>
						<DomainSetupContent
							canVerify={canVerifyDomains}
							domain={domain}
							error={error}
							isSubmitting={isVerifying}
							onVerify={verifyCurrentDomain}
						/>
					</SettingsDialogMain>
				) : null}
			</SettingsDialogContent>
		</SettingsDialog>
	);
}

function DeleteDomainButton({
	canDeleteDomains,
	domain,
	onDeleted,
	onClose,
	onOpen,
	open,
	workspaceSlug,
}: DeleteDomainButtonProps) {
	const deleteDomain = useServerFn(deleteWorkspaceDomainFn);
	const [error, setError] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const isDraft = domain.status === "pending";
	const label = isDraft
		? m["dashboard.settings.domains.delete_draft"]()
		: m["dashboard.settings.domains.delete_domain"]();

	const removeDomain = async () => {
		setError(null);
		setIsDeleting(true);

		try {
			const result = await deleteDomain({
				data: {
					domainId: domain.id,
					workspaceSlug,
				},
			});

			if (result.status === "error") {
				setError(result.error);
				return;
			}

			onClose();
			await onDeleted();
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<AlertDialog
			onOpenChange={(open) => {
				if (open) {
					onOpen();
				} else {
					setError(null);
					onClose();
				}
			}}
			open={open}
		>
			<AlertDialogTrigger asChild>
				<Button
					aria-label={`${label} ${domain.domain}`}
					disabled={!canDeleteDomains}
					size="icon-sm"
					type="button"
					variant="ghost"
				>
					<Trash2Icon className="size-4" />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent className="rounded-3xl border shadow-xl">
				<AlertDialogCancel
					aria-label={m[
						"dashboard.settings.domains.close_delete_confirmation"
					]()}
					className="absolute top-5 right-5 size-8 rounded-full border-0 p-0"
					disabled={isDeleting}
				>
					<XIcon className="size-4" />
				</AlertDialogCancel>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{m["dashboard.settings.domains.delete_title"]({
							domain: domain.domain,
							label,
						})}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{isDraft
							? m["dashboard.settings.domains.delete_draft_description"]()
							: m["dashboard.settings.domains.delete_domain_description"]()}
					</AlertDialogDescription>
				</AlertDialogHeader>
				{error ? (
					<p className="text-destructive text-sm" role="alert">
						{error}
					</p>
				) : null}
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isDeleting}>
						{m["dashboard.settings.cancel"]()}
					</AlertDialogCancel>
					<Button
						disabled={isDeleting}
						onClick={removeDomain}
						type="button"
						variant="destructive"
					>
						{isDeleting ? m["dashboard.settings.domains.deleting"]() : label}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

function DomainSettingsLoading() {
	return (
		<SettingsGroup>
			{Array.from({ length: 3 }).map((_, index) => (
				<SettingsBlock
					description={<Skeleton className="h-4 w-56" />}
					key={index.toString()}
					title={<Skeleton className="h-4 w-36" />}
				/>
			))}
		</SettingsGroup>
	);
}

export const DomainSettingsPage: SettingsPageComponent = ({
	workspaceSlug,
}) => {
	const getDomains = useServerFn(getWorkspaceDomainsFn);
	const [data, setData] = useState<DashboardWorkspaceDomainsData | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const fetchDomains = useCallback(
		() =>
			getDomains({
				data: {
					workspaceSlug,
				},
			}),
		[getDomains, workspaceSlug],
	);

	const loadDomains = useCallback(async () => {
		setError(null);
		setIsLoading(true);

		try {
			setData(await fetchDomains());
		} catch {
			setError(m["dashboard.settings.domains.load_error"]());
		} finally {
			setIsLoading(false);
		}
	}, [fetchDomains]);

	useEffect(() => {
		let ignoreResult = false;

		const loadActivePage = async () => {
			setError(null);
			setIsLoading(true);

			try {
				const domainsData = await fetchDomains();

				if (!ignoreResult) {
					setData(domainsData);
				}
			} catch {
				if (!ignoreResult) {
					setError(m["dashboard.settings.domains.load_error"]());
				}
			} finally {
				if (!ignoreResult) {
					setIsLoading(false);
				}
			}
		};

		loadActivePage();

		return () => {
			ignoreResult = true;
		};
	}, [fetchDomains]);

	const upsertDomain = useCallback((domain: DashboardWorkspaceDomain) => {
		setData((currentData) => {
			if (!currentData) {
				return currentData;
			}

			const hasDomain = currentData.domains.some(
				(currentDomain) => currentDomain.id === domain.id,
			);

			return {
				...currentData,
				domains: hasDomain
					? currentData.domains.map((currentDomain) =>
							currentDomain.id === domain.id ? domain : currentDomain,
						)
					: [domain, ...currentData.domains],
			};
		});
	}, []);
	const domains = data?.domains ?? [];
	const [domainMenu, setDomainMenu] = useQueryState(
		"domainMenu",
		parseAsStringLiteral(domainMenuItems).withOptions(domainMenuQueryOptions),
	);
	const [domainStep, setDomainStep] = useQueryState(
		"domainStep",
		parseAsStringLiteral(domainDialogSteps).withOptions(domainMenuQueryOptions),
	);
	const [selectedDomainId, setSelectedDomainId] = useQueryState(
		"domainId",
		parseAsString.withOptions(domainMenuQueryOptions),
	);
	const selectedDomain =
		domains.find((domain) => domain.id === selectedDomainId) ?? null;
	const activeDomainStep =
		domainMenu === "add" &&
		domainStep &&
		domainStep !== "domain" &&
		!selectedDomain
			? "domain"
			: (domainStep ?? "domain");
	const closeDomainMenu = useCallback(() => {
		void setDomainMenu(null);
		void setDomainStep(null);
		void setSelectedDomainId(null);
	}, [setDomainMenu, setDomainStep, setSelectedDomainId]);
	const openDomainMenu = useCallback(
		(menuItem: DomainMenuItem, domainId?: string) => {
			void setDomainMenu(menuItem);
			void setDomainStep(menuItem === "add" ? "domain" : null);
			void setSelectedDomainId(domainId ?? null);
		},
		[setDomainMenu, setDomainStep, setSelectedDomainId],
	);

	if (isLoading && !data) {
		return <DomainSettingsLoading />;
	}

	if (error && !data) {
		return (
			<SettingsBanner
				action={
					<Button
						onClick={loadDomains}
						size="sm"
						type="button"
						variant="outline"
					>
						{m["dashboard.settings.domains.retry"]()}
					</Button>
				}
				description={error}
				title={m["dashboard.settings.domains.load_error"]()}
				variant="destructive"
			/>
		);
	}

	return (
		<div className="grid gap-4">
			<AddDomainDialog
				domain={selectedDomain}
				onClose={closeDomainMenu}
				onDomainChange={upsertDomain}
				onSelectedDomainChange={(domainId) => {
					void setSelectedDomainId(domainId);
				}}
				onStepChange={(step) => {
					void setDomainStep(step);
				}}
				open={domainMenu === "add"}
				step={activeDomainStep}
				workspaceSlug={workspaceSlug}
			/>
			<ManageDomainDialog
				canVerifyDomains={data?.canVerifyDomains ?? false}
				domain={selectedDomain}
				onClose={closeDomainMenu}
				onDomainChange={upsertDomain}
				open={domainMenu === "manage" && Boolean(selectedDomain)}
				workspaceSlug={workspaceSlug}
			/>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<p className="max-w-xl text-pretty text-muted-foreground text-sm">
					{m["dashboard.settings.domains.intro"]()}
				</p>
				<Button
					disabled={!data?.canAddDomains}
					onClick={() => openDomainMenu("add")}
					size="sm"
					type="button"
				>
					<PlusIcon className="size-4" />
					{m["dashboard.settings.domains.add"]()}
				</Button>
			</div>
			{error ? (
				<p className="text-destructive text-sm" role="alert">
					{error}
				</p>
			) : null}
			{domains.length ? (
				<SettingsGroup>
					{domains.map((domain) => (
						<SettingsBlock
							control={
								<div className="flex items-center gap-1">
									<Button
										onClick={() => openDomainMenu("manage", domain.id)}
										size="sm"
										type="button"
										variant="outline"
									>
										{m["dashboard.settings.domains.manage"]()}
									</Button>
									<DeleteDomainButton
										canDeleteDomains={data?.canDeleteDomains ?? false}
										domain={domain}
										onClose={closeDomainMenu}
										onDeleted={loadDomains}
										onOpen={() => openDomainMenu("delete", domain.id)}
										open={
											domainMenu === "delete" && selectedDomainId === domain.id
										}
										workspaceSlug={workspaceSlug}
									/>
								</div>
							}
							description={
								<span className="flex flex-wrap items-center gap-2">
									<Badge
										variant={
											domain.status === "verified" ? "default" : "outline"
										}
									>
										{domainStatusLabel[domain.status]()}
									</Badge>
									<span className="tabular-nums">
										{m["dashboard.settings.domains.address_count"]({
											count: domain.addressCount,
										})}
									</span>
									<span>
										{m["dashboard.settings.domains.dns_record_count"]({
											count: domain.dnsRecords.length,
										})}
									</span>
									{domain.dnsProvider === "cloudflare" ? (
										<Badge variant="secondary">Cloudflare</Badge>
									) : null}
								</span>
							}
							key={domain.id}
							title={domain.domain}
						/>
					))}
				</SettingsGroup>
			) : (
				<SettingsBanner
					action={
						<Button
							disabled={!data?.canAddDomains}
							onClick={() => openDomainMenu("add")}
							size="sm"
							type="button"
						>
							<PlusIcon className="size-4" />
							{m["dashboard.settings.domains.add"]()}
						</Button>
					}
					description={m["dashboard.settings.domains.empty_description"]()}
					icon={<GlobeIcon />}
					title={m["dashboard.settings.domains.empty_title"]()}
				/>
			)}
		</div>
	);
};
