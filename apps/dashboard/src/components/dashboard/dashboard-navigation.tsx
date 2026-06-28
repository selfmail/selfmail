import { Dialog } from "@base-ui/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@selfmail/ui";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "#/lib/utils";
import { m } from "#/paraglide/messages";
import SettingsDialog, { settingsDialogHandle } from "../settings";
import type { DashboardAddress } from "./types";

const buildLinks = [
  "dashboard.navigation.ai",
  "dashboard.navigation.workflows",
  "dashboard.navigation.developers",
] as const;
const workspaceLinks = [
  { href: "#workspace", label: m["dashboard.navigation.contacts"] },
  { href: "#workspace", label: m["dashboard.navigation.conversations"] },
  { action: "settings", label: m["dashboard.navigation.settings"] },
] as const;

const addressLabelMaxLength = 24;

interface DashboardNavigationProps {
  addresses: DashboardAddress[];
  currentAddressSlug?: string;
  memberId: string;
  workspaceId: string;
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

interface AddressNavLinkProps {
  active: boolean;
  address: DashboardAddress;
  workspaceSlug: string;
}

function NavColumn({ children, className, title }: NavColumnProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
      <p className="text-muted-foreground text-sm">{title}</p>
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
          "block w-fit max-w-64 truncate rounded-md font-medium text-foreground text-xl ring-accent transition-all group-hover:bg-accent group-hover:ring-4",
          active && "bg-accent ring-4"
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

function AddressNavLink({
  active,
  address,
  workspaceSlug,
}: AddressNavLinkProps) {
  const label = formatAddressLabel(address.email);
  const link = (
    <Link
      className="group w-full"
      params={{
        addressSlug: address.addressSlug,
        workspaceSlug,
      }}
      to="/$workspaceSlug/$addressSlug"
    >
      <span
        className={cn(
          "block w-fit max-w-64 truncate rounded-md font-medium text-foreground text-xl ring-accent transition-all group-hover:bg-accent group-hover:ring-4",
          active && "bg-accent ring-4"
        )}
      >
        {label}
      </span>
    </Link>
  );

  if (label === address.email) {
    return link;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="bottom">{address.email}</TooltipContent>
    </Tooltip>
  );
}

export function DashboardNavigation({
  addresses,
  currentAddressSlug,
  workspaceId,
  memberId,
  workspaceSlug,
}: DashboardNavigationProps) {
  // Fetch adresses
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
              "block w-fit max-w-64 truncate rounded-md font-medium text-foreground text-xl ring-accent transition-all group-hover:bg-accent group-hover:ring-4",
              !currentAddressSlug && "bg-accent ring-4"
            )}
          >
            {m["dashboard.inbox.unified"]()}
          </span>
        </Link>
        <TooltipProvider delayDuration={500} disableHoverableContent>
          {addresses.map((address) => (
            <AddressNavLink
              active={address.addressSlug === currentAddressSlug}
              address={address}
              key={address.id}
              workspaceSlug={workspaceSlug}
            />
          ))}
        </TooltipProvider>
        <Link
          className="text-muted-foreground text-sm hover:text-foreground hover:underline"
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
        <SettingsDialog memberId={memberId} workspaceId={workspaceId} />
        {workspaceLinks.map((link) =>
          "action" in link ? (
            <Dialog.Trigger
              className="group w-full cursor-pointer"
              handle={settingsDialogHandle}
              id="navigation"
              key={link.label()}
              payload={{ page: "app" }}
              type="button"
            >
              <span
                className={cn(
                  "block w-fit max-w-64 truncate rounded-md font-medium text-foreground text-xl ring-accent transition-all group-hover:bg-accent group-hover:ring-4"
                )}
              >
                {link.label()}
              </span>
            </Dialog.Trigger>
          ) : (
            <DashboardNavLink href={link.href} key={link.label()}>
              {link.label()}
            </DashboardNavLink>
          )
        )}
      </NavColumn>
    </nav>
  );
}
