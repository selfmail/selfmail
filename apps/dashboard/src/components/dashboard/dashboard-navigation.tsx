import { Dialog } from "@base-ui/react";
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@selfmail/ui";
import { Link } from "@tanstack/react-router";
import { ChevronDownIcon } from "lucide-react";
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

type NavDensity = "compact" | "regular";
type NavColumnValue = "addresses" | "build" | "workspace";

interface NavColumnProps {
  compactAtTwoColumns?: boolean;
  renderContent: (density: NavDensity) => ReactNode;
  title: string;
  value: NavColumnValue;
}

interface DashboardNavLinkProps {
  active?: boolean;
  children: ReactNode;
  density: NavDensity;
  href: string;
  title?: string;
}

interface AddressNavLinkProps {
  active: boolean;
  address: DashboardAddress;
  density: NavDensity;
  workspaceSlug: string;
}

const linkSizeClassName = {
  compact: "max-w-full text-lg",
  regular: "max-w-64 text-xl",
} as const satisfies Record<NavDensity, string>;
const linkSpacingClassName = {
  compact: "mb-1 ml-1",
  regular: "mb-1",
} as const satisfies Record<NavDensity, string>;

function NavColumn({
  compactAtTwoColumns,
  renderContent,
  title,
  value,
}: NavColumnProps) {
  return (
    <div
      className={cn(
        "min-w-0 [@container_dashboard-shell_(max-height:_42rem)]:col-auto! [@container_dashboard-shell_(max-height:_42rem)]:max-w-none!",
        compactAtTwoColumns &&
          "@2xl/dashboard-shell:col-span-full @min-[68rem]/dashboard-shell:col-auto @2xl/dashboard-shell:max-w-96 @min-[68rem]/dashboard-shell:max-w-none"
      )}
    >
      <div
        className={cn(
          "[@container_dashboard-shell_(max-height:_42rem)]:hidden! @2xl/dashboard-shell:flex hidden min-w-0 flex-col gap-3",
          compactAtTwoColumns &&
            "@min-[68rem]/dashboard-shell:flex @2xl/dashboard-shell:hidden"
        )}
      >
        <p className="text-muted-foreground text-sm">{title}</p>
        {renderContent("regular")}
      </div>
      <AccordionPrimitive.Root
        className={cn(
          "[@container_dashboard-shell_(max-height:_42rem)]:flex! flex @2xl/dashboard-shell:hidden min-w-0 flex-col",
          compactAtTwoColumns &&
            "@2xl/dashboard-shell:flex @min-[68rem]/dashboard-shell:hidden"
        )}
        defaultValue={[]}
      >
        <AccordionPrimitive.Item value={value}>
          <AccordionPrimitive.Header className="flex">
            <AccordionPrimitive.Trigger className="group/dashboard-nav-trigger flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg py-1 text-left font-medium text-muted-foreground text-sm outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
              <span className="truncate">{title}</span>
              <ChevronDownIcon className="size-4 shrink-0 group-data-panel-open/dashboard-nav-trigger:rotate-180" />
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Panel className="overflow-hidden" keepMounted>
            <div className="flex min-w-0 flex-col gap-3 pt-3">
              {renderContent("compact")}
            </div>
          </AccordionPrimitive.Panel>
        </AccordionPrimitive.Item>
      </AccordionPrimitive.Root>
    </div>
  );
}

function DashboardNavLink({
  active,
  children,
  density,
  href,
  title,
}: DashboardNavLinkProps) {
  return (
    <a className="group w-full" href={href} title={title}>
      <span
        className={cn(
          "block w-fit truncate rounded-md font-medium text-foreground ring-accent transition-all group-hover:bg-accent group-hover:ring-4",
          linkSizeClassName[density],
          linkSpacingClassName[density],
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
  density,
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
          "block w-fit truncate rounded-md font-medium text-foreground ring-accent transition-all group-hover:bg-accent group-hover:ring-4",
          linkSizeClassName[density],
          linkSpacingClassName[density],
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
  const renderAddressLinks = (density: NavDensity) => (
    <>
      <Link
        className="group w-full"
        params={{ workspaceSlug }}
        to="/$workspaceSlug"
      >
        <span
          className={cn(
            "block w-fit truncate rounded-md font-medium text-foreground ring-accent transition-all group-hover:bg-accent group-hover:ring-4",
            linkSizeClassName[density],
            linkSpacingClassName[density],
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
            density={density}
            key={address.id}
            workspaceSlug={workspaceSlug}
          />
        ))}
      </TooltipProvider>
      <Link
        className={cn(
          "text-muted-foreground text-sm hover:text-foreground hover:underline",
          linkSpacingClassName[density]
        )}
        params={{ workspaceSlug }}
        to="/$workspaceSlug/new-address"
      >
        + {m["dashboard.address.add"]()}
      </Link>
    </>
  );
  const renderBuildLinks = (density: NavDensity) =>
    buildLinks.map((link) => (
      <DashboardNavLink density={density} href="#build" key={link}>
        {m[link]()}
      </DashboardNavLink>
    ));
  const renderWorkspaceLinks = (density: NavDensity) =>
    workspaceLinks.map((link) =>
      "action" in link ? (
        <Dialog.Trigger
          className="group w-full cursor-pointer text-left"
          handle={settingsDialogHandle}
          id={`navigation-${density}`}
          key={link.label()}
          payload={{ page: "app" }}
          type="button"
        >
          <span
            className={cn(
              "block w-fit truncate rounded-md font-medium text-foreground ring-accent transition-all group-hover:bg-accent group-hover:ring-4",
              linkSizeClassName[density],
              linkSpacingClassName[density]
            )}
          >
            {link.label()}
          </span>
        </Dialog.Trigger>
      ) : (
        <DashboardNavLink density={density} href={link.href} key={link.label()}>
          {link.label()}
        </DashboardNavLink>
      )
    );

  return (
    <nav className="[@container_dashboard-shell_(max-height:_42rem)]:justify-stretch! grid w-full min-w-0 @2xl/dashboard-shell:grid-cols-[repeat(2,minmax(0,max-content))] @min-[68rem]/dashboard-shell:grid-cols-[repeat(3,minmax(0,max-content))] grid-cols-1 items-start @2xl/dashboard-shell:justify-between @2xl/dashboard-shell:gap-8 gap-4 [@container_dashboard-shell_(max-height:_42rem)]:grid-cols-1! [@container_dashboard-shell_(max-height:_42rem)]:gap-3!">
      <SettingsDialog memberId={memberId} workspaceId={workspaceId} />
      <NavColumn
        renderContent={renderAddressLinks}
        title={m["dashboard.address.navigation_label"]()}
        value="addresses"
      />
      <NavColumn
        renderContent={renderBuildLinks}
        title={m["dashboard.navigation.build"]()}
        value="build"
      />
      <NavColumn
        compactAtTwoColumns
        renderContent={renderWorkspaceLinks}
        title={m["dashboard.navigation.workspace"]()}
        value="workspace"
      />
    </nav>
  );
}
