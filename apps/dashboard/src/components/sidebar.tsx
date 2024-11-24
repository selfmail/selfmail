"use client"
import { cn } from "@/lib/cn";
import {
    BookmarkIcon,
    ChevronLeftIcon,
    CogIcon,
    CreditCardIcon,
    ExclamationCircleIcon,
    HomeIcon,
    InboxIcon,
    PaperAirplaneIcon,
    PencilIcon,
    QuestionMarkCircleIcon,
    TrashIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';
import Link from "next/link";
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
    external?: boolean;
}

interface Adresses {
    name?: string,
    catchAll?: boolean,
    email?: string,
}

const mainNavItems: SidebarItem[] = [
    { name: "Overview", icon: HomeIcon },
    { name: "Inbox", icon: InboxIcon, count: 12 },
    { name: "Drafts", icon: PencilIcon, count: 1 },
    { name: "Sent", icon: PaperAirplaneIcon },
    { name: "Trash", icon: TrashIcon },
    { name: "Spam", icon: ExclamationCircleIcon },
    { name: "Members", icon: UserGroupIcon },
    { name: "Groups & Bookmarks", icon: BookmarkIcon },
];

const bottomItems: SidebarItem[] = [
    { name: 'Support', icon: QuestionMarkCircleIcon, external: true },
    { name: 'Plans', icon: CreditCardIcon },
    { name: 'Settings', icon: CogIcon },
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
                        <SidebarLink href="/t" key={item.name} item={item} />
                    ))}
                </div>

                <div className="mt-6">
                    <div className="px-3 py-1.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Adresses
                    </div>
                    <div className="mt-1 space-y-0.5">
                    </div>
                </div>
            </nav>

            {/* Bottom Items */}
            <div className="border-t border-t-border">
                <div className="px-3 py-4">
                    {bottomItems.map((item) => (
                        <SidebarLink href="/t" key={item.name} item={item} />
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

    return (
        <Link
            href={href}
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