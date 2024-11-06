import {
    BellIcon,
    ChartBarIcon,
    CheckIcon,
    CogIcon,
    CreditCardIcon,
    DocumentTextIcon,
    EnvelopeIcon,
    HomeIcon,
    QuestionMarkCircleIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline';
import React from 'react';

interface SidebarItem {
    name: string;
    icon: React.ElementType;
    count?: number;
    external?: boolean;
}

const mainNavItems: SidebarItem[] = [
    { name: 'Dashboard', icon: HomeIcon },
    { name: 'Notifications', icon: BellIcon, count: 12 },
    { name: 'Tasks', icon: CheckIcon },
    { name: 'Notes', icon: DocumentTextIcon },
    { name: 'Emails', icon: EnvelopeIcon },
    { name: 'Reports', icon: ChartBarIcon },
    { name: 'Automations', icon: CogIcon },
    { name: 'Workflows', icon: CogIcon },
];

const favoriteItems: SidebarItem[] = [
    { name: 'UK & EU Companies', icon: UserGroupIcon },
    { name: 'B2B Relationship Building', icon: UserGroupIcon },
    { name: 'Potential Partnership', icon: UserGroupIcon },
    { name: 'CRM Meeting Template', icon: DocumentTextIcon },
];

const recordItems: SidebarItem[] = [
    { name: 'Companies', icon: UserGroupIcon },
    { name: 'People', icon: UserGroupIcon },
];

const bottomItems: SidebarItem[] = [
    { name: 'Affiliate program', icon: CreditCardIcon, external: true },
    { name: 'Help center', icon: QuestionMarkCircleIcon, external: true },
    { name: 'Plans', icon: CreditCardIcon },
    { name: 'Settings', icon: CogIcon },
];

export default function Sidebar() {
    return (
        <aside className="sticky top-0 flex flex-col h-screen w-[280px] bg-background border-r border-border">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center">
                        {/* Logo */}
                    </div>
                    <div>
                        <h2 className="text-[15px] font-medium text-text-primary">Mintify Bytes</h2>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3">
                <div className="space-y-0.5 py-2">
                    {mainNavItems.map((item) => (
                        <SidebarLink key={item.name} item={item} />
                    ))}
                </div>

                <div className="mt-6">
                    <div className="px-3 py-1.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Favorites
                    </div>
                    <div className="mt-1 space-y-0.5">
                        {favoriteItems.map((item) => (
                            <SidebarLink key={item.name} item={item} showStar />
                        ))}
                    </div>
                </div>

                <div className="mt-6">
                    <div className="px-3 py-1.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Records
                    </div>
                    <div className="mt-1 space-y-0.5">
                        {recordItems.map((item) => (
                            <SidebarLink key={item.name} item={item} />
                        ))}
                    </div>
                </div>
            </nav>

            {/* Bottom Items */}
            <div className="border-t border-t-border">
                <div className="px-3 py-4">
                    {bottomItems.map((item) => (
                        <SidebarLink key={item.name} item={item} />
                    ))}
                </div>

                {/* User Profile */}
                <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-background-tertiary ring-1 ring-border">
                            {/* User profile icon */}
                        </div>
                        <div>
                            <div className="font-medium text-[var(--text-primary)]">Julia Chang</div>
                            <div className="text-sm text-neutral-400">juliachang@gmail.com</div>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

interface SidebarLinkProps {
    item: SidebarItem;
    showStar?: boolean;
}

const SidebarLink = ({ item, showStar }: SidebarLinkProps) => {
    const Icon = item.icon;

    return (
        <a
            href="#"
            className="flex items-center gap-3 px-3 py-1.5 text-[14px] text-text-secondary
                rounded-md hover:bg-hover-bg hover:text-hover-text group"
        >
            <Icon className="w-[18px] h-[18px] text-[var(--text-tertiary)] group-hover:text-hover-text" />
            <span className="flex-1">{item.name}</span>
            {item.count && (
                <span className="text-xs text-[var(--text-tertiary)]">{item.count}</span>
            )}
        </a>
    );
};