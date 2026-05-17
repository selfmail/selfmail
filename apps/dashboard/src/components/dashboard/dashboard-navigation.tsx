import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "#/lib/utils";
import { m } from "#/paraglide/messages";
import type { DashboardAddress } from "./types";

const buildLinks = [
  "dashboard.navigation.ai",
  "dashboard.navigation.workflows",
  "dashboard.navigation.developers",
] as const;
const workspaceLinks = [
  "dashboard.navigation.domains",
  "dashboard.navigation.members",
  "dashboard.navigation.activity",
  "dashboard.navigation.storage",
  "dashboard.navigation.settings",
] as const;

const addressLabelMaxLength = 24;

interface DashboardNavigationProps {
  addresses: DashboardAddress[];
  currentAddressSlug?: string;
  onOpenSettings: () => void;
  previewOpen?: boolean;
  workspaceSlug: string;
}

interface NavColumnProps {
  children: ReactNode;
  className?: string;
  title: string;
}

interface DashboardNavLinkProps {
  active?: boolean;
  children: ReactNode;
  href: string;
  title?: string;
}

function NavColumn({ children, className, title }: NavColumnProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
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
          active && "bg-neutral-200 ring-4"
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
  onOpenSettings,
  workspaceSlug,
}: DashboardNavigationProps) {
  return (
    <nav
      className={cn(
        "@container flex w-full min-w-0 flex-col gap-8 md:flex-row md:justify-between"
      )}
    >
      <NavColumn title={m["dashboard.address.navigation_label"]()}>
        <Link
          className="group w-full"
          params={{ workspaceSlug }}
          to="/$workspaceSlug"
        >
          <span
            className={cn(
              "block w-fit max-w-64 truncate rounded-md font-medium text-black text-xl ring-neutral-200 transition-all group-hover:bg-neutral-200 group-hover:ring-4",
              !currentAddressSlug && "bg-neutral-200 ring-4"
            )}
          >
            {m["dashboard.inbox.unified"]()}
          </span>
        </Link>
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
                  "bg-neutral-200 ring-4"
              )}
            >
              {formatAddressLabel(address.email)}
            </span>
          </Link>
        ))}
        <Link
          className="text-blue-500 text-sm"
          params={{ workspaceSlug }}
          to="/$workspaceSlug/new-address"
        >
          + {m["dashboard.address.add"]()}
        </Link>
      </NavColumn>
      <NavColumn title={m["dashboard.navigation.build"]()}>
        {buildLinks.map((link) => (
          <DashboardNavLink href="#build" key={link}>
            {m[link]()}
          </DashboardNavLink>
        ))}
      </NavColumn>
      <NavColumn title={m["dashboard.navigation.workspace"]()}>
        {workspaceLinks.map((link) =>
          link === "dashboard.navigation.settings" ? (
            <button
              className="group w-full cursor-pointer text-left"
              key={link}
              onClick={onOpenSettings}
              type="button"
            >
              <span className="w-fit rounded-md font-medium text-black text-xl ring-neutral-200 transition-all group-hover:bg-neutral-200 group-hover:ring-4 group-focus-visible:bg-neutral-200 group-focus-visible:ring-4">
                {m[link]()}
              </span>
            </button>
          ) : (
            <DashboardNavLink href="#workspace" key={link}>
              {m[link]()}
            </DashboardNavLink>
          )
        )}
      </NavColumn>
    </nav>
  );
}
