import { ArrowUpRightIcon } from "lucide-react";
import { type ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../ui/navigation-menu";

export interface MenuLink {
  label: string;
  href: string;
  description?: string;
  external?: boolean;
}

export interface MenuSection {
  label: string;
  links: MenuLink[];
}

export interface MenuGroup {
  label: string;
  sections: MenuSection[];
  rightContent?: ReactNode;
}

export interface MegaMenuProps {
  label: string;
  groups: MenuGroup[];
  links: MenuLink[];
}

export default function MegaMenu({ label, groups, links }: MegaMenuProps) {
  const [value, setValue] = useState<string | null>(null);

  return (
    <>
      <div
        aria-hidden="true"
        className="mega-menu-backdrop fixed inset-x-0 top-14 bottom-0 z-20 hidden bg-black/40 lg:block 2xl:top-22"
        data-open={value !== null}
      />
      <NavigationMenu
        aria-label={label}
        className="relative z-40"
        onValueChange={setValue}
        value={value}
      >
        <NavigationMenuList className="gap-4 xl:gap-6">
          {groups.map((group) => (
            <NavigationMenuItem key={group.label} value={group.label}>
              <NavigationMenuTrigger>{group.label}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid grid-cols-2 items-start gap-8">
                  <div
                    className={cn(
                      "grid min-w-0 items-start gap-6",
                      group.sections.length > 1 && "xl:grid-cols-2"
                    )}
                  >
                    {group.sections.map((section) => (
                      <section className="min-w-0" key={section.label}>
                        <h2 className="mb-3 whitespace-normal font-mono text-muted text-xs uppercase tracking-wider">
                          {section.label}
                        </h2>
                        <ul className="grid gap-2">
                          {section.links.map((link) => (
                            <li key={link.href}>
                              <NavigationMenuLink
                                className="w-fit max-w-full whitespace-normal py-1 text-base"
                                href={link.href}
                                rel={
                                  link.external
                                    ? "noopener noreferrer"
                                    : undefined
                                }
                                target={link.external ? "_blank" : undefined}
                              >
                                <span className="flex items-center gap-1">
                                  {link.label}
                                  {link.external && (
                                    <ArrowUpRightIcon
                                      aria-hidden="true"
                                      className="size-5 shrink-0"
                                    />
                                  )}
                                </span>
                                {link.description && (
                                  <span className="mt-1 block text-muted text-sm">
                                    {link.description}
                                  </span>
                                )}
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ))}
                  </div>
                  <div className="min-w-0 whitespace-normal">
                    {group.rightContent}
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ))}
          {links.map((link) => (
            <NavigationMenuItem key={link.href}>
              <NavigationMenuLink
                className="py-3 text-muted text-sm hover:text-foreground"
                href={link.href}
              >
                {link.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </>
  );
}
