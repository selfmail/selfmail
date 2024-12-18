"use client"
import { cn } from "@/lib/cn";
import {
    BanknotesIcon,
    BookmarkIcon,
    BookOpenIcon,
    BugAntIcon,
    ChevronLeftIcon,
    ClockIcon,
    CogIcon,
    CreditCardIcon,
    ExclamationCircleIcon,
    ExclamationTriangleIcon,
    HomeIcon,
    InboxIcon,
    PaperAirplaneIcon,
    PencilIcon,
    QuestionMarkCircleIcon,
    SquaresPlusIcon,
    TrashIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { create } from "zustand";
import { persist, PersistOptions } from 'zustand/middleware';

type State = {
    state: boolean
}

type Action = {
    setState: (state: State['state']) => void
}

export const useSidebarStore = create<State & Action>()(
    persist<State & Action>(
        (set) => ({
            state: true,
            setState: (state) => set(() => ({ state })),
        }),
        {
            name: 'sidebar-store',
        } as PersistOptions<State & Action>
    )
);

interface SidebarItem {
    name: string;
    icon: any;
    count?: number;
    href: string;
    external?: boolean;
}

interface Adresses {
    name?: string,
    catchAll?: boolean,
    email?: string,
}

const mainNavItems: SidebarItem[] = [
    { name: "Overview", icon: HomeIcon, href: "" },
    { name: "Inbox", icon: InboxIcon, count: 12, href: "/inbox" },
    { name: "Drafts", icon: PencilIcon, count: 1, href: "/drafts" },
    { name: "Sent", icon: PaperAirplaneIcon, href: "/sent" },
    { name: "Trash", icon: TrashIcon, href: "/trash" },
    { name: "Spam", icon: ExclamationCircleIcon, href: "/spam" },
    { name: "Members", icon: UserGroupIcon, href: "/members" },
    { name: "Groups & Bookmarks", icon: BookmarkIcon, href: "/groups-bookmarks" },
];

const bottomItems: SidebarItem[] = [
    { name: 'Support', icon: QuestionMarkCircleIcon, external: true, href: "/support" },
    { name: 'Plans', icon: CreditCardIcon, href: "/plans" },
    { name: 'Settings', icon: CogIcon, href: "/settings" },
];

const automations: SidebarItem[] = [
    { name: 'Automations', icon: CogIcon, href: "/automations" },
    { name: 'Scheduler', icon: ClockIcon, href: "/automations/scheduler" },
    { name: 'Rules', icon: BookOpenIcon, href: "/automations/rules" },
    { name: 'Templates', icon: SquaresPlusIcon, href: "/automations/templates" },
    { name: 'Errors', icon: BugAntIcon, href: "/automations/errors" },
    { name: 'Pricing', icon: BanknotesIcon, href: "/automations/pricing" },
];

type user = {
    name: string,
    mainName?: string,
    color?: string,
    email?: string,
}

export default function Sidebar({
    activeTeam,
    userDetails,
    adresses
}: {
    activeTeam: any,
    userDetails: user,
    adresses: Adresses[]
}) {

    const { state, setState } = useSidebarStore();

    return (
        <aside className={cn("sticky top-0 flex flex-col h-screen w-[280px] bg-background border-r border-border", state ? "" : "hidden")}>
            {/* Header */}
            <div className="px-4 py-3 border-b border-border flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center">
                        {/* Logo */}
                    </div>
                    <div>
                        <h2 className="text-[15px] font-medium text-text-primary">Mintify Bytes</h2>
                    </div>
                </div>
                <button onClick={() => setState(false)} aria-label="Close Sidebar">
                    <ChevronLeftIcon className="w-4 h-4 text-text-secondary" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3">
                <div className="space-y-0.5 py-2">
                    {mainNavItems.map((item) => (
                        <SidebarLink href={item.href} key={item.name} item={item} />
                    ))}
                </div>

                <div className="mt-6">
                    <div className="px-3 py-1.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Adresses
                    </div>
                    <div className="mt-1 space-y-0.5">
                        {adresses.length === 0 && (<div className="px-3 flex space-x-1 items-center"><ExclamationTriangleIcon style={{ color: "#eab308" }} color="green" className="h-4 w-4" /> <p className="text-neutral-500">No adresses belongs to you.</p></div>)}
                    </div>
                </div>

                <div className="mt-6">
                    <div className="px-3 py-1.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Automations
                    </div>
                    <div className="mt-1 space-y-0.5">
                        {automations.map((item) => (
                            <SidebarLink href={item.href} key={item.name} item={item} />
                        ))}
                    </div>
                </div>
            </nav>

            {/* Bottom Items */}
            <div className="border-t border-t-border">
                <div className="px-3 py-4">
                    {bottomItems.map((item) => (
                        <SidebarLink href={item.href} key={item.name} item={item} />
                    ))}
                </div>

                {/* User Profile */}
                <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-400">
                            {/* User profile icon */}
                        </div>
                        <div>
                            {userDetails.mainName && (<div className="font-medium  flex space-x-2"><p className="text-text">{userDetails.mainName}</p><p className="text-[#696969]">{userDetails.name}</p></div>)}
                            {!userDetails.mainName && (<div className="font-medium  flex space-x-2"><p className="text-text">{userDetails.name}</p></div>)}
                            {userDetails.email && (<div className="text-sm text-neutral-400">{userDetails.email}</div>)}
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

interface SidebarLinkProps {
    item: SidebarItem;
    href: string
}

export const SidebarLink = ({ item, href }: SidebarLinkProps) => {
    const Icon = item.icon;
    const team = usePathname().split("/")[1]
    return (
        <Link
            href={`/${team}${href.startsWith("/") ? "" : "/"}${href}`}
            className="flex items-center gap-3 px-3 py-1.5 text-[14px] text-text-secondary
                rounded-md hover:bg-hover-bg hover:text-hover-text group"
        >
            <Icon className="w-[18px] h-[18px] text-text-tertiary group-hover:text-hover-text" />
            <span className="flex-1">{item.name}</span>
            {item.count && (
                <span className="text-xs text-text-tertiary">{item.count}</span>
            )}
        </Link>
    );
};