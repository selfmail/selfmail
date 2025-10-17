import { component$, Slot } from "@builder.io/qwik";
import { Link, type LinkProps, useLocation } from "@builder.io/qwik-city";

type NavLinkProps = LinkProps & { activeClass?: string, groupHover?: boolean };

// copied straight from qwik.dev docs :) (but ofc own styles and modified)
export const NavLink = component$(({ activeClass, groupHover = true, ...props }: NavLinkProps) => {
    const location = useLocation();
    const toPathname = props.href ?? "";
    const locationPathname = location.url.pathname;

    const startSlashPosition =
        toPathname !== "/" && toPathname.startsWith("/")
            ? toPathname.length - 1
            : toPathname.length;
    const endSlashPosition =
        toPathname !== "/" && toPathname.endsWith("/")
            ? toPathname.length - 1
            : toPathname.length;
    const isActive =
        locationPathname === toPathname ||
        (locationPathname.endsWith(toPathname) &&
            (locationPathname.charAt(endSlashPosition) === "/" ||
                locationPathname.charAt(startSlashPosition) === "/"));

    // Determine hover classes based on groupHover prop
    const hoverClasses = groupHover
        ? "group-hover:bg-neutral-200 group-hover:ring-4"
        : "hover:bg-neutral-200 hover:ring-4";

    return (
        <Link
            {...props}
            class="group w-full">
            <span
                class={[
                    "w-fit rounded-md font-medium text-black text-xl ring-neutral-200 transition-all",
                    hoverClasses,
                    props.class,
                    isActive && "bg-neutral-200 ring-4",
                ]}
            >
                <Slot />
            </span>
        </Link>
    );
});
