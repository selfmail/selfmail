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

const Sidebar = () => {
    return (
        <div className="flex flex-col h-screen w-[280px] bg-[#111111] border-r border-neutral-800">
            {/* Header */}
            <div className="px-4 py-3 border-b border-neutral-800">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center">
                        {/* Optional: Add a small icon or logo here */}
                    </div>
                    <div>
                        <h2 className="text-[15px] font-medium text-neutral-100">Mintify Bytes</h2>
                        <p className="text-[13px] text-neutral-400">12 members</p>
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
            <div className="border-t border-neutral-800">
                <div className="px-3 py-4">
                    {bottomItems.map((item) => (
                        <SidebarLink key={item.name} item={item} />
                    ))}
                </div>

                {/* User Profile */}
                <div className="p-4 border-t border-neutral-800">
                    <div className="flex items-center gap-3">
                        <img
                            src="/avatar-placeholder.png"
                            alt="Profile"
                            className="w-8 h-8 rounded-full ring-1 ring-neutral-800"
                        />
                        <div>
                            <div className="font-medium text-neutral-100">Julia Chang</div>
                            <div className="text-sm text-neutral-400">juliachang@gmail.com</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
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
            className="flex items-center gap-3 px-3 py-1.5 text-[14px] text-neutral-300 rounded-md hover:bg-neutral-900 group"
        >
            <Icon className="w-[18px] h-[18px] text-neutral-500 group-hover:text-neutral-300" />
            <span className="flex-1">{item.name}</span>
            {item.count && (
                <span className="text-xs text-neutral-500">{item.count}</span>
            )}
            {item.external && (
                <svg
                    className="w-3.5 h-3.5 text-neutral-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                </svg>
            )}
            {showStar && (
                <svg
                    className="w-4 h-4 text-amber-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            )}
        </a>
    );
};

export default Sidebar;
