import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "#/lib/utils";

const platformLinks = ["Ai", "Workflows", "Developers", "Changelog"];
const workspaceLinks = [
  "Members",
  "Activity",
  "Storage",
  "Settings",
  "Domains",
];

interface DashboardNavigationProps {
  addresses: string[];
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
}

function NavColumn({ children, title }: NavColumnProps) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <p className="text-neutral-700 text-sm">{title}</p>
      {children}
    </div>
  );
}

function DashboardNavLink({ active, children, href }: DashboardNavLinkProps) {
  return (
    <a className="group w-full" href={href}>
      <span
        className={cn(
          "w-fit rounded-md font-medium text-black text-xl ring-neutral-200 transition-all group-hover:bg-neutral-200 group-hover:ring-4",
          active && "bg-neutral-200 ring-4"
        )}
      >
        {children}
      </span>
    </a>
  );
}

export function DashboardNavigation({
  addresses,
  workspaceSlug,
}: DashboardNavigationProps) {
  return (
    <nav className="flex w-full flex-col justify-between gap-8 md:flex-row">
      <NavColumn title="Addresses">
        {addresses.map((address, index) => (
          <DashboardNavLink active={index === 0} href="#address" key={address}>
            {address}
          </DashboardNavLink>
        ))}
        <a className="text-blue-500 text-sm" href="#new-address">
          + Add new address
        </a>
      </NavColumn>
      <NavColumn title="Platform">
        {platformLinks.map((link) => (
          <DashboardNavLink href="#platform" key={link}>
            {link}
          </DashboardNavLink>
        ))}
      </NavColumn>
      <NavColumn title="Workspace">
        {workspaceLinks.map((link) => (
          link === "Settings" ? (
            <Link
              className="group w-full"
              key={link}
              params={{ workspaceSlug }}
              to="/$workspaceSlug/settings"
            >
              <span className="w-fit rounded-md font-medium text-black text-xl ring-neutral-200 transition-all group-hover:bg-neutral-200 group-hover:ring-4">
                {link}
              </span>
            </Link>
          ) : (
            <DashboardNavLink href="#workspace" key={link}>
              {link}
            </DashboardNavLink>
          )
        ))}
      </NavColumn>
    </nav>
  );
}
