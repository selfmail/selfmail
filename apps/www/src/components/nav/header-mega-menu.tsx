import { ArrowUpRightIcon } from "lucide-react";
import { NavigationMenuLink } from "../ui/navigation-menu";
import MegaMenu, {
  type MegaMenuProps,
  type MenuGroup,
  type MenuLink,
} from "./mega-menu";

export interface HeaderMenuGroup extends Omit<MenuGroup, "rightContent"> {
  feature: MenuLink;
}

interface HeaderMegaMenuProps extends Omit<MegaMenuProps, "groups"> {
  groups: HeaderMenuGroup[];
}

export default function HeaderMegaMenu({
  groups,
  ...props
}: HeaderMegaMenuProps) {
  return (
    <MegaMenu
      {...props}
      groups={groups.map(({ feature, ...group }) => ({
        ...group,
        rightContent: (
          <NavigationMenuLink
            className="flex min-h-40 flex-col justify-between gap-6 rounded-xl border border-border bg-background p-6"
            href={feature.href}
          >
            <span className="font-mono text-muted text-xs uppercase tracking-wider">
              {group.label}
            </span>
            <span className="flex items-center justify-between gap-4 text-xl">
              {feature.label}
              <ArrowUpRightIcon
                aria-hidden="true"
                className="size-5 shrink-0"
              />
            </span>
          </NavigationMenuLink>
        ),
      }))}
    />
  );
}
