import { component$, Slot } from "@builder.io/qwik";
import { Link, type LinkProps, useLocation } from "@builder.io/qwik-city";

type NavLinkProps = LinkProps & { activeClass?: string };

// copied straight from qwik.dev docs :)
export const NavLink = component$(({ activeClass, ...props }: NavLinkProps) => {
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

    return (
        <Link
            {...props}
            class="group w-full">
            <span
                class={[
                    "w-fit rounded-md font-medium text-black text-xl ring-neutral-200 transition-all group-hover:bg-neutral-200 group-hover:ring-4",
                    props.class,
                    isActive && "bg-neutral-200 ring-4",
                ]}
            >
                <Slot />
            </span>
        </Link>
    );
});
