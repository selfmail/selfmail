import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "#/lib/utils";
import { m } from "#/paraglide/messages";
import type { DashboardAddress } from "./types";

const platformLinks = [
	"dashboard.navigation.ai",
	"dashboard.navigation.workflows",
	"dashboard.navigation.developers",
	"dashboard.navigation.changelog",
] as const;
const workspaceLinks = [
	"dashboard.navigation.members",
	"dashboard.navigation.activity",
	"dashboard.navigation.storage",
	"dashboard.navigation.settings",
	"dashboard.navigation.domains",
] as const;
const addressLabelMaxLength = 24;

interface DashboardNavigationProps {
	addresses: DashboardAddress[];
	currentAddressSlug?: string;
	workspaceSlug: string;
}

interface NavColumnProps {
	children: ReactNode;
	title: string;
}

interface DashboardNavLinkProps {
	active?: boolean;
	children: ReactNode;
	href: string;
	title?: string;
}

function NavColumn({ children, title }: NavColumnProps) {
	return (
		<div className="flex min-w-0 flex-col gap-3">
			<p className="text-neutral-700 text-sm">{title}</p>
			{children}
		</div>
	);
}

function DashboardNavLink({
	active,
	children,
	href,
	title,
}: DashboardNavLinkProps) {
	return (
		<a className="group w-full" href={href} title={title}>
			<span
				className={cn(
					"block w-fit max-w-64 truncate rounded-md font-medium text-black text-xl ring-neutral-200 transition-all group-hover:bg-neutral-200 group-hover:ring-4",
					active && "bg-neutral-200 ring-4",
				)}
			>
				{children}
			</span>
		</a>
	);
}

function formatAddressLabel(address: string) {
	if (address.length <= addressLabelMaxLength) {
		return address;
	}

	return `${address.slice(0, addressLabelMaxLength - 3)}...`;
}

export function DashboardNavigation({
	addresses,
	currentAddressSlug,
	workspaceSlug,
}: DashboardNavigationProps) {
	return (
		<nav className="flex w-full flex-col justify-between gap-8 md:flex-row">
			<NavColumn title={m["dashboard.address.navigation_label"]()}>
				{addresses.map((address) => (
					<Link
						className="group w-full"
						key={address.id}
						params={{
							addressSlug: address.addressSlug,
							workspaceSlug,
						}}
						title={address.email}
						to="/$workspaceSlug/$addressSlug"
					>
						<span
							className={cn(
								"block w-fit max-w-64 truncate rounded-md font-medium text-black text-xl ring-neutral-200 transition-all group-hover:bg-neutral-200 group-hover:ring-4",
								address.addressSlug === currentAddressSlug &&
									"bg-neutral-200 ring-4",
							)}
						>
							{formatAddressLabel(address.email)}
						</span>
					</Link>
				))}
				<a className="text-blue-500 text-sm" href="#new-address">
					+ {m["dashboard.address.add"]()}
				</a>
			</NavColumn>
			<NavColumn title={m["dashboard.navigation.platform"]()}>
				{platformLinks.map((link) => (
					<DashboardNavLink href="#platform" key={link}>
						{m[link]()}
					</DashboardNavLink>
				))}
			</NavColumn>
			<NavColumn title={m["dashboard.navigation.workspace"]()}>
				{workspaceLinks.map((link) =>
					link === "dashboard.navigation.settings" ? (
						<Link
							className="group w-full"
							key={link}
							params={{ workspaceSlug }}
							to="/$workspaceSlug/settings"
						>
							<span className="w-fit rounded-md font-medium text-black text-xl ring-neutral-200 transition-all group-hover:bg-neutral-200 group-hover:ring-4">
								{m[link]()}
							</span>
						</Link>
					) : (
						<DashboardNavLink href="#workspace" key={link}>
							{m[link]()}
						</DashboardNavLink>
					),
				)}
			</NavColumn>
		</nav>
	);
}
