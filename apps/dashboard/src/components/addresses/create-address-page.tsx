import { Dialog } from "@base-ui/react";
import {
	Button,
	Input,
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@selfmail/ui";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeftIcon, SettingsIcon } from "lucide-react";
import { type FormEvent, useState } from "react";
import SettingsDialog, { settingsDialogHandle } from "#/components/settings";
import {
	createWorkspaceAddressFn,
	type DashboardAddressDomain,
	type DashboardWorkspace,
} from "#/lib/workspaces";
import { m } from "#/paraglide/messages";

interface CreateAddressPageProps {
	domains: DashboardAddressDomain[];
	memberId: string;
	workspace: DashboardWorkspace;
}

const toAddressLocalPart = (value: string) =>
	value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9._-]+/g, "")
		.replace(/^[._-]+|[._-]+$/g, "");

export function CreateAddressPage({
	domains,
	memberId,
	workspace,
}: CreateAddressPageProps) {
	const [address, setAddress] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedDomainId, setSelectedDomainId] = useState(domains[0]?.id);
	const navigate = useNavigate();
	const selectedDomain =
		domains.find((domain) => domain.id === selectedDomainId) ?? domains[0];
	const domain = selectedDomain?.domain ?? `${workspace.slug}.selfmail.app`;

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!address) {
			setError(m["dashboard.address.create.error"]());
			return;
		}

		setError(null);
		setIsSubmitting(true);

		try {
			const result = await createWorkspaceAddressFn({
				data: {
					domainId: selectedDomain?.id,
					handle: address,
					workspaceSlug: workspace.slug,
				},
			});

			if (result.status === "error") {
				setError(result.error);
				return;
			}

			await navigate({
				params: {
					addressSlug: result.addressSlug,
					workspaceSlug: workspace.slug,
				},
				to: "/$workspaceSlug/$addressSlug",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<main className="relative flex min-h-dvh w-full items-center justify-center bg-background px-5 py-20 text-foreground">
			<SettingsDialog memberId={memberId} workspaceId={workspace.id} />
			<Link
				className="absolute top-5 left-5 inline-flex items-center gap-1 rounded-md py-2 pr-3 font-medium text-muted-foreground text-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25"
				params={{ workspaceSlug: workspace.slug }}
				to="/$workspaceSlug"
			>
				<ChevronLeftIcon className="size-4" />
				{m["dashboard.address.create.back"]()}
			</Link>
			<Dialog.Trigger
				aria-label={m["dashboard.navigation.settings"]()}
				className="absolute top-5 right-5 inline-flex size-10 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25"
				handle={settingsDialogHandle}
				id="new-address-settings"
				payload={{ page: "app" }}
				type="button"
			>
				<SettingsIcon className="size-5" />
			</Dialog.Trigger>

			<form
				className="flex w-full max-w-lg flex-col gap-5"
				noValidate
				onSubmit={handleSubmit}
			>
				<div className="flex flex-col gap-4">
					<h1 className="text-balance font-medium text-3xl">
						{m["dashboard.address.create.title"]()}
					</h1>

					<div>
						<label className="sr-only" htmlFor="new-address">
							{m["dashboard.address.create.field_label"]()}
						</label>
						<div className="grid grid-cols-[minmax(7rem,1fr)_minmax(10rem,52%)]">
							<Input
								aria-describedby={error ? "new-address-error" : undefined}
								aria-invalid={Boolean(error)}
								className="rounded-r-none border-r border-r-border text-lg"
								id="new-address"
								onChange={(event) => {
									setAddress(toAddressLocalPart(event.target.value));
									setError(null);
								}}
								placeholder={m["dashboard.address.create.placeholder"]()}
								value={address}
							/>
							<Select
								disabled={domains.length === 0}
								onValueChange={(domainId) => {
									setSelectedDomainId(domainId);
									setError(null);
								}}
								value={selectedDomain?.id}
							>
								<SelectTrigger
									className="min-w-0 rounded-l-none border-l-0 px-5 text-lg [&>span]:min-w-0 [&>span]:truncate"
									title={domain}
								>
									<SelectValue placeholder={`@ ${domain}`} />
								</SelectTrigger>
								<SelectContent
									align="end"
									className="w-auto max-w-[calc(100vw-2rem)]"
								>
									<SelectGroup>
										{domains.map((domain) => (
											<SelectItem key={domain.id} value={domain.id}>
												@ {domain.domain}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
						</div>
						{error ? (
							<p
								className="mt-2 text-destructive text-sm"
								id="new-address-error"
							>
								{error}
							</p>
						) : null}
					</div>
				</div>

				<Dialog.Trigger
					className="w-fit font-medium text-lg underline underline-offset-4 hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25"
					handle={settingsDialogHandle}
					id="new-address-add-domain"
					payload={{ page: "domains" }}
					type="button"
				>
					{m["dashboard.address.create.connect_domain"]()}
				</Dialog.Trigger>

				<Button
					className="w-full cursor-pointer text-base"
					disabled={isSubmitting}
					size="lg"
					type="submit"
				>
					{isSubmitting
						? m["dashboard.address.create.saving"]()
						: m["dashboard.address.create.submit"]()}
				</Button>
			</form>
		</main>
	);
}
